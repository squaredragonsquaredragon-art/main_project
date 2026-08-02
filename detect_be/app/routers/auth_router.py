from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth_schema import RegisterSchema, LoginSchema, RefreshSchema, ChangePasswordSchema
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user_model import User

from fastapi import APIRouter, Depends, Request, Query

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
async def login(
    data: LoginSchema,
    request: Request,
    app: str = Query("all"),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).login(data, request, app)


@router.post("/token/refresh/", summary="Refresh access token")
async def refresh_token(
    data: RefreshSchema,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).refresh(data.refresh)


@router.post("/logout/", summary="Logout (invalidate refresh token)")
async def logout(
    data: RefreshSchema,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).logout(data.refresh, request)


@router.get("/me/", summary="Get current user info")
async def me(current_user: User = Depends(get_current_user)):
    from app.schemas.user_schema import UserOut
    return UserOut.model_validate(current_user)


@router.post("/change-password/", summary="Change password")
async def change_password(
    data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AuthService(db).change_password(
        current_user.id, data.current_password, data.new_password
    )
