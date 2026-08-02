from pydantic import BaseModel
from datetime import datetime
from typing import List


class AlertOut(BaseModel):
    id: str
    user_id: str
    alert_type: str
    description: str
    ip_address: str
    location: str
    risk_score: float
    is_read: bool
    severity: str
    ai_analysis: str = ""
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertsResponse(BaseModel):
    total: int
    unread: int
    items: List[AlertOut]


