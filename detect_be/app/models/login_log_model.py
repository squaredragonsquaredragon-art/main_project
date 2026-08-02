import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class LoginLog(Base):
    __tablename__ = "login_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    username: Mapped[str] = mapped_column(String(100), default="")  # stored denormalized for quick display
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[str] = mapped_column(Text, default="")
    browser: Mapped[str] = mapped_column(String(100), default="")
    os: Mapped[str] = mapped_column(String(100), default="")
    device: Mapped[str] = mapped_column(String(50), default="")     # Desktop | Mobile | Tablet
    location: Mapped[str] = mapped_column(String(255), default="Unknown")
    country: Mapped[str] = mapped_column(String(100), default="")
    city: Mapped[str] = mapped_column(String(100), default="")
    source_app: Mapped[str] = mapped_column(String(20), default="system", index=True)  # payment | instagram | system
    event_type: Mapped[str] = mapped_column(String(20), default="activity", index=True)  # register | login | failed | activity
    status: Mapped[str] = mapped_column(String(20), default="normal")  # normal | suspicious | blocked
    is_suspicious: Mapped[bool] = mapped_column(Boolean, default=False)
    risk_score: Mapped[float] = mapped_column(default=0.0)
    login_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
