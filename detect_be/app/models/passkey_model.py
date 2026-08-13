import uuid
from datetime import datetime
from sqlalchemy import String, Integer, LargeBinary, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Passkey(Base):
    """
    Stores WebAuthn credential public keys linked to a user.
    One user may have multiple passkeys (phone + laptop + etc.)
    """
    __tablename__ = "passkeys"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Credential ID from browser (base64url encoded), must be unique across all passkeys
    credential_id: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)

    # CBOR-encoded public key bytes returned by the browser during registration
    public_key: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    # Signature counter — incremented each authentication.
    # If the counter ever goes backwards, it means someone cloned the credential.
    sign_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Human-readable device label (e.g. "Face ID", "Windows Hello", "Touch ID")
    device_name: Mapped[str] = mapped_column(String(120), default="Passkey", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
