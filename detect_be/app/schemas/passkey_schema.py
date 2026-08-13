from pydantic import BaseModel
from typing import Any, Optional


# ─── Registration ────────────────────────────────────────────────────────────

class PasskeyRegisterBeginRequest(BaseModel):
    username: str  # The username (or email) of the ALREADY-registered user


class PasskeyRegisterFinishRequest(BaseModel):
    username: str
    credential: dict[str, Any]   # Raw PublicKeyCredential JSON from navigator.credentials.create()
    device_name: str = "Passkey" # Optional: "Face ID", "Fingerprint", "Windows Hello"


# ─── Authentication ──────────────────────────────────────────────────────────

class PasskeyAuthBeginRequest(BaseModel):
    username: str  # The user identifying themselves


class PasskeyAuthFinishRequest(BaseModel):
    username: str
    credential: dict[str, Any]  # Raw PublicKeyCredential JSON from navigator.credentials.get()


# ─── List / Manage ───────────────────────────────────────────────────────────

class PasskeyOut(BaseModel):
    id: str
    credential_id: str
    device_name: str
    created_at: str

    model_config = {"from_attributes": True}
