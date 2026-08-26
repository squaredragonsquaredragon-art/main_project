from pydantic import BaseModel, EmailStr, field_validator
import re


class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone_number: str
    first_name: str = ""
    last_name: str = ""

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username must contain only letters, numbers, and underscores")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Phone number is required for 📲 security alerts")
        # Accept formats: +91XXXXXXXXXX or 91XXXXXXXXXX or 10-digit number
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^(\+?\d{10,15})$", cleaned):
            raise ValueError("Phone number must be 10-15 digits (e.g. +919876543210)")
        return cleaned



class LoginSchema(BaseModel):
    username: str       # accepts username OR email
    password: str


class TokenSchema(BaseModel):
    access: str
    refresh: str


class RefreshSchema(BaseModel):
    refresh: str


class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str = "access"


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ForgotUsernameSchema(BaseModel):
    email_or_phone: str
    otp_code: str = ""


class ForgotPasswordRequestSchema(BaseModel):
    username_or_email: str


class ForgotPasswordSchema(BaseModel):
    username_or_email: str
    new_password: str
    otp_code: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

