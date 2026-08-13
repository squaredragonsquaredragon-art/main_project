"""
PasskeyService — full WebAuthn/Passkey implementation using the `webauthn` library (v3.x).

Flow:
  REGISTER:
    1. Client calls begin_registration(username) → gets PublicKeyCredentialCreationOptions JSON
    2. Browser calls navigator.credentials.create(options) → user does Face ID / Fingerprint
    3. Client calls finish_registration(username, credential) → server stores public key in DB

  AUTHENTICATE:
    1. Client calls begin_authentication(username) → gets PublicKeyCredentialRequestOptions JSON
    2. Browser calls navigator.credentials.get(options) → user authenticates
    3. Client calls finish_authentication(username, credential) → server verifies → issues JWT
"""

import base64
import json
import os
import time

from fastapi import HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_model import User
from app.models.passkey_model import Passkey
from app.schemas.passkey_schema import PasskeyRegisterFinishRequest, PasskeyAuthFinishRequest
from app.schemas.user_schema import UserOut
from app.utils.jwt_handler import create_access_token, create_refresh_token
from app.utils.logger import get_logger
from app.config import settings as _cfg

logger = get_logger(__name__)

# ─── WebAuthn configuration ───────────────────────────────────────────────────
RP_ID = _cfg.WEBAUTHN_RP_ID
RP_NAME = _cfg.WEBAUTHN_RP_NAME
EXPECTED_ORIGIN = list({
    _cfg.WEBAUTHN_ORIGIN.rstrip("/"),
    _cfg.FRONTEND_URL.rstrip("/"),
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004",
    "http://127.0.0.1:3005",
})

# ─── In-memory challenge store ───────────────────────────────────────────────
_challenge_store: dict[str, dict] = {}
CHALLENGE_TTL = 300  # seconds


def _store_challenge(key: str, challenge_bytes: bytes) -> None:
    _challenge_store[key] = {
        "challenge": base64.b64encode(challenge_bytes).decode(),
        "expires_at": time.time() + CHALLENGE_TTL,
    }


def _pop_challenge(key: str) -> bytes:
    entry = _challenge_store.pop(key, None)
    if not entry:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "No active passkey challenge found. Please begin again."
        )
    if time.time() > entry["expires_at"]:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Passkey challenge expired. Please begin again."
        )
    return base64.b64decode(entry["challenge"])


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    s = s.replace("-", "+").replace("_", "/")
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.b64decode(s)


class PasskeyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ─── Helpers ─────────────────────────────────────────────────────────────

    async def _get_user(self, username: str) -> User:
        from app.models.app_users import PaymentUser, InstagramUser

        # Check main users table
        result = await self.db.execute(
            select(User).where(or_(User.username == username, User.email == username))
        )
        user = result.scalar_one_or_none()
        if user:
            return user

        # Check payment mirror
        res = await self.db.execute(
            select(PaymentUser).where(or_(PaymentUser.username == username, PaymentUser.email == username))
        )
        app_user = res.scalar_one_or_none()
        if app_user:
            mirror = await self.db.execute(select(User).where(User.id == app_user.id))
            u = mirror.scalar_one_or_none()
            if u:
                return u

        # Check instagram mirror
        res = await self.db.execute(
            select(InstagramUser).where(or_(InstagramUser.username == username, InstagramUser.email == username))
        )
        app_user = res.scalar_one_or_none()
        if app_user:
            mirror = await self.db.execute(select(User).where(User.id == app_user.id))
            u = mirror.scalar_one_or_none()
            if u:
                return u

        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User '{username}' not found")

    def _tokens(self, user_id: str) -> dict:
        return {
            "access": create_access_token(user_id),
            "refresh": create_refresh_token(user_id),
        }

    # ─── Registration ─────────────────────────────────────────────────────────

    async def begin_registration(self, username: str) -> dict:
        import webauthn
        from webauthn.helpers.structs import (
            AuthenticatorSelectionCriteria,
            UserVerificationRequirement,
            ResidentKeyRequirement,
            AuthenticatorAttachment,
        )

        user = await self._get_user(username)
        challenge = os.urandom(32)
        _store_challenge(f"reg_{username}", challenge)

        # Existing credentials to exclude (prevent duplicate registration)
        existing = await self.db.execute(
            select(Passkey.credential_id).where(Passkey.user_id == user.id)
        )
        exclude_creds = []
        for cred_id in existing.scalars().all():
            try:
                exclude_creds.append(
                    webauthn.helpers.structs.PublicKeyCredentialDescriptor(
                        id=_b64url_decode(cred_id)
                    )
                )
            except Exception:
                pass

        options = webauthn.generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=user.id.encode(),
            user_name=username,
            user_display_name=f"{user.first_name} {user.last_name}".strip() or username,
            challenge=challenge,
            authenticator_selection=AuthenticatorSelectionCriteria(
                authenticator_attachment=AuthenticatorAttachment.PLATFORM,
                user_verification=UserVerificationRequirement.PREFERRED,
                resident_key=ResidentKeyRequirement.PREFERRED,
            ),
            exclude_credentials=exclude_creds,
            timeout=60000,
        )

        return json.loads(webauthn.options_to_json(options))

    async def finish_registration(self, req: PasskeyRegisterFinishRequest) -> dict:
        import webauthn
        from webauthn.helpers import parse_registration_credential_json

        user = await self._get_user(req.username)
        expected_challenge = _pop_challenge(f"reg_{req.username}")

        try:
            credential = parse_registration_credential_json(req.credential)

            verified = webauthn.verify_registration_response(
                credential=credential,
                expected_challenge=expected_challenge,
                expected_rp_id=RP_ID,
                expected_origin=EXPECTED_ORIGIN,
                require_user_verification=False,
            )
        except Exception as e:
            logger.error(f"Passkey registration failed for '{req.username}': {e}")
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Passkey verification failed: {str(e)}")

        cred_id_str = _b64url_encode(verified.credential_id)

        passkey = Passkey(
            user_id=user.id,
            credential_id=cred_id_str,
            public_key=verified.credential_public_key,
            sign_count=verified.sign_count,
            device_name=req.device_name,
        )
        self.db.add(passkey)
        await self.db.commit()

        logger.info(f"✅ Passkey registered for '{req.username}' — {req.device_name}")
        return {
            "detail": "Passkey registered successfully",
            "credential_id": cred_id_str,
            "device_name": req.device_name,
        }

    # ─── Authentication ───────────────────────────────────────────────────────

    async def begin_authentication(self, username: str) -> dict:
        import webauthn
        from webauthn.helpers.structs import (
            UserVerificationRequirement,
            PublicKeyCredentialDescriptor,
        )

        user = await self._get_user(username)

        result = await self.db.execute(
            select(Passkey.credential_id).where(Passkey.user_id == user.id)
        )
        cred_ids = result.scalars().all()

        if not cred_ids:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "No passkeys registered for this account. Please register a passkey first."
            )

        challenge = os.urandom(32)
        _store_challenge(f"auth_{username}", challenge)

        allow_creds = [
            PublicKeyCredentialDescriptor(id=_b64url_decode(cred_id))
            for cred_id in cred_ids
        ]

        options = webauthn.generate_authentication_options(
            rp_id=RP_ID,
            challenge=challenge,
            allow_credentials=allow_creds,
            user_verification=UserVerificationRequirement.PREFERRED,
            timeout=60000,
        )

        return json.loads(webauthn.options_to_json(options))

    async def finish_authentication(self, req: PasskeyAuthFinishRequest) -> dict:
        import webauthn
        from webauthn.helpers import parse_authentication_credential_json

        user = await self._get_user(req.username)
        expected_challenge = _pop_challenge(f"auth_{req.username}")

        cred_dict = req.credential
        credential_id_b64 = cred_dict["id"]

        # Look up stored passkey
        stored_result = await self.db.execute(
            select(Passkey).where(
                Passkey.user_id == user.id,
                Passkey.credential_id == credential_id_b64,
            )
        )
        passkey = stored_result.scalar_one_or_none()

        if not passkey:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Passkey not found for this account.")

        try:
            credential = parse_authentication_credential_json(req.credential)

            verification = webauthn.verify_authentication_response(
                credential=credential,
                expected_challenge=expected_challenge,
                expected_rp_id=RP_ID,
                expected_origin=EXPECTED_ORIGIN,
                credential_public_key=passkey.public_key,
                credential_current_sign_count=passkey.sign_count,
                require_user_verification=True,
            )
        except Exception as e:
            logger.error(f"Passkey auth failed for '{req.username}': {e}")
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Passkey verification failed: {str(e)}")

        # Update sign counter (replay attack protection)
        passkey.sign_count = verification.new_sign_count
        await self.db.commit()

        tokens = self._tokens(user.id)
        user_out = UserOut.model_validate(user).model_dump()

        clean_username = user.username
        for prefix in ["payment_", "instagram_"]:
            if user.username.startswith(prefix):
                clean_username = user.username[len(prefix):]
                break
        user_out["username"] = clean_username

        logger.info(f"✅ Passkey auth success for '{req.username}'")
        return {**tokens, "user": user_out}

    # ─── Management ──────────────────────────────────────────────────────────

    async def list_passkeys(self, user_id: str) -> list[dict]:
        result = await self.db.execute(
            select(Passkey).where(Passkey.user_id == user_id).order_by(Passkey.created_at)
        )
        passkeys = result.scalars().all()
        return [
            {
                "id": pk.id,
                "credential_id": pk.credential_id[:20] + "...",
                "device_name": pk.device_name,
                "created_at": pk.created_at.isoformat(),
            }
            for pk in passkeys
        ]

    async def delete_passkey(self, passkey_id: str, user_id: str) -> dict:
        result = await self.db.execute(
            select(Passkey).where(Passkey.id == passkey_id, Passkey.user_id == user_id)
        )
        passkey = result.scalar_one_or_none()
        if not passkey:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Passkey not found")
        await self.db.delete(passkey)
        await self.db.commit()
        return {"detail": "Passkey deleted successfully"}
