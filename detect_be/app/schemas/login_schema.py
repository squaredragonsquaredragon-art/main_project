from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class LoginLogOut(BaseModel):
    id: str
    user_id: str
    username: str = ""
    ip_address: str
    browser: str
    os: str
    device: str
    location: str
    country: str
    city: str
    status: str
    is_suspicious: bool
    risk_score: float
    source_app: str = "system"
    event_type: str = "activity"
    login_time: datetime

    model_config = {"from_attributes": True}


class LoginLogCreate(BaseModel):
    user_id: str
    ip_address: str
    user_agent: str
    username: str = ""
    browser: str = ""
    os: str = ""
    device: str = ""
    location: str = "Unknown"
    country: str = ""
    city: str = ""
    status: str = "normal"
    is_suspicious: bool = False
    risk_score: float = 0.0
    source_app: str = "system"
    event_type: str = "activity"


class LoginHistoryResponse(BaseModel):
    total: int
    items: List[LoginLogOut]
    page: int
    page_size: int
