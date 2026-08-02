import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class SuspiciousLog(Base):
    __tablename__ = "suspicious_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    login_log_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("login_logs.id", ondelete="CASCADE"), nullable=True
    )
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # alert_type: geo_anomaly | brute_force | unusual_time | new_device | unknown_ip
    description: Mapped[str] = mapped_column(Text, default="")
    ip_address: Mapped[str] = mapped_column(String(45), default="")
    location: Mapped[str] = mapped_column(String(255), default="")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low | medium | high | critical
    ai_analysis: Mapped[str] = mapped_column(Text, nullable=True, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
