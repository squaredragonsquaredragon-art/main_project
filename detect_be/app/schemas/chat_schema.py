from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserSendMessageSchema(BaseModel):
    message: str


class AdminSendMessageSchema(BaseModel):
    user_id: str
    message: str


class EditMessageSchema(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: str
    user_id: str
    sender_type: str
    sender_name: str
    message: str
    encrypted_message: Optional[str] = None
    is_encrypted: bool = True
    encryption_algorithm: str = "AES-256-CBC / Fernet Cryptography"
    is_read: bool
    is_edited: bool = False
    is_deleted: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    user_id: str
    username: str
    email: str
    phone_number: Optional[str] = ""
    last_message: str
    last_message_time: datetime
    unread_count: int


class UserDetailProfile(BaseModel):
    user_id: str
    username: str
    email: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone_number: Optional[str] = ""
    role: str
    is_active: bool
    created_at: datetime
    total_logins: int = 0
    suspicious_count: int = 0
    risk_level: str = "NORMAL"
    latest_ip: Optional[str] = "127.0.0.1"
    latest_device: Optional[str] = "Desktop / Browser"


class AIChatSchema(BaseModel):
    message: str
    history: Optional[list[dict]] = []


class UserMovementObserveSchema(BaseModel):
    target_user: Optional[str] = "all"
    prompt: Optional[str] = None
    history: Optional[list[dict]] = []


