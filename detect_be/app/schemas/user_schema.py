from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_staff: bool
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserAdminUpdate(UserUpdate):
    is_active: Optional[bool] = None
    is_staff: Optional[bool] = None
    role: Optional[str] = None


class UserListOut(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool
    role: str
    created_at: datetime
    total_logins: int = 0
    suspicious_count: int = 0
    last_login: Optional[datetime] = None
    risk_level: str = "low"

    model_config = {"from_attributes": True}
