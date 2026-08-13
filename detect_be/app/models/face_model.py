import uuid
from datetime import datetime
from sqlalchemy import String, LargeBinary, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class FaceCredential(Base):
    """
    Stores facial descriptor / normalized face matrix linked to a user.
    Used for camera-based facial recognition authentication.
    """
    __tablename__ = "face_credentials"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    # Binary blob of the normalized grayscale 128x128 face matrix
    face_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
