from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth_schema import (
    RegisterSchema, LoginSchema, RefreshSchema, ChangePasswordSchema,
    ForgotUsernameSchema, ForgotPasswordSchema, ForgotPasswordRequestSchema
)
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/", summary="Register a new user")
async def register(
    data: RegisterSchema,
    request: Request,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).register(data, request, app)


@router.post("/login/", summary="Login and receive JWT tokens")
@router.post("/login", summary="Login alias")
async def login(
    data: LoginSchema,
    request: Request,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).login(data, request, app)


@router.post("/verify-credentials/", summary="Verify Username & Password credentials before Biometric prompt")
@router.post("/verify-credentials", summary="Verify credentials alias")
async def verify_credentials(
    data: LoginSchema,
    request: Request,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).verify_credentials(data, request, app)


@router.post("/token/refresh/", summary="Refresh access token")
async def refresh_token(
    data: RefreshSchema,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).refresh(data.refresh)


@router.post("/logout/", summary="Logout (invalidate refresh token)")
@router.post("/logout", summary="Logout alias")
async def logout(
    request: Request,
    data: RefreshSchema | None = None,
    db: AsyncSession = Depends(get_db),
):
    refresh_str = data.refresh if data else None
    return await AuthService(db).logout(refresh_str, request)


@router.get("/me/", summary="Get current user info")
@router.get("/me", summary="Get current user info alias")
async def me(current_user: User = Depends(get_current_user)):
    from app.schemas.user_schema import UserOut
    return UserOut.model_validate(current_user)


@router.post("/change-password/", summary="Change password")
@router.post("/change-password", summary="Change password alias")
async def change_password(
    data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).change_password(
        current_user.id, data.current_password, data.new_password
    )


@router.post("/forgot-username/", summary="Recover forgotten username by email")
@router.post("/forgot-username", summary="Recover forgotten username by email alias")
async def forgot_username(
    data: ForgotUsernameSchema,
    app: str = Query("all") if "Query" in globals() else "all",
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).forgot_username(data.email, app)


@router.post("/forgot-password/request-otp/", summary="Request 6-digit Security OTP for password reset")
@router.post("/forgot-password/request-otp", summary="Request 6-digit Security OTP alias")
async def request_password_reset_otp(
    data: ForgotPasswordRequestSchema,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).request_reset_otp(data.username_or_email, app)


@router.post("/forgot-password/", summary="Reset forgotten password and notify back office")
@router.post("/forgot-password", summary="Reset forgotten password alias")
async def forgot_password(
    data: ForgotPasswordSchema,
    request: Request,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).forgot_password(data, request, app)


@router.get("/devices/", summary="Get all linked devices and active sessions for user")
@router.get("/devices", summary="Get all linked devices alias")
async def get_linked_devices(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).get_linked_devices(current_user, request)


@router.post("/safe-account/", summary="Safe Account — Revoke and logout all devices for user")
@router.post("/safe-account", summary="Safe Account alias")
@router.post("/safe-account/logout-all/", summary="Safe Account logout all alias")
@router.post("/safe-account/logout-all", summary="Safe Account logout all alias 2")
async def safe_account_logout_all(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).safe_account_logout_all(current_user, request)


