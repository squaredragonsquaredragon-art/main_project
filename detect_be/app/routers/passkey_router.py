from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.passkey_schema import (
    PasskeyRegisterBeginRequest,
    PasskeyRegisterFinishRequest,
    PasskeyAuthBeginRequest,
    PasskeyAuthFinishRequest,
)
from app.services.passkey_service import PasskeyService

router = APIRouter(prefix="/passkey", tags=["Passkeys"])


@router.post("/register/begin/", summary="Begin WebAuthn passkey registration")
async def passkey_register_begin(
    data: PasskeyRegisterBeginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns PublicKeyCredentialCreationOptions for the browser.
    Call this right after account creation, then pass the result to
    navigator.credentials.create() in the browser.
    """
    return await PasskeyService(db).begin_registration(data.username)


@router.post("/register/finish/", summary="Complete WebAuthn passkey registration")
async def passkey_register_finish(
    data: PasskeyRegisterFinishRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives the credential from navigator.credentials.create().
    Verifies attestation and stores credential_id + public_key in DB.
    """
    return await PasskeyService(db).finish_registration(data)


@router.post("/auth/begin/", summary="Begin WebAuthn passkey authentication")
async def passkey_auth_begin(
    data: PasskeyAuthBeginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns PublicKeyCredentialRequestOptions for the browser.
    Pass the result to navigator.credentials.get() in the browser.
    """
    return await PasskeyService(db).begin_authentication(data.username)


@router.post("/auth/finish/", summary="Complete WebAuthn passkey authentication → JWT issued")
async def passkey_auth_finish(
    data: PasskeyAuthFinishRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives the assertion from navigator.credentials.get().
    Verifies the signature cryptographically. On success, returns
    { access, refresh, user } — same structure as normal login.
    """
    return await PasskeyService(db).finish_authentication(data)


@router.get("/list/", summary="List all passkeys registered by the current user")
async def list_passkeys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all passkeys registered for the currently authenticated user."""
    return await PasskeyService(db).list_passkeys(current_user.id)


@router.delete("/{passkey_id}/", summary="Delete a registered passkey")
async def delete_passkey(
    passkey_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Removes a specific passkey from the user's account."""
    return await PasskeyService(db).delete_passkey(passkey_id, current_user.id)
