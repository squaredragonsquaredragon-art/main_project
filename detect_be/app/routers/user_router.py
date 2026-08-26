from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_model import User
from app.services.user_service import UserService
from app.schemas.user_schema import UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/", summary="Get current user profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserService(db).get_me(current_user.id)


@router.patch("/me/", summary="Update current user profile")
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserService(db).update_profile(current_user.id, data)


@router.get("/devices/", summary="Get linked devices for user")
@router.get("/devices", summary="Get linked devices alias")
async def user_linked_devices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.auth_service import AuthService
    return await AuthService(db).get_linked_devices(current_user, None)


@router.post("/safe-account/", summary="Safe Account logout all devices for user")
@router.post("/safe-account", summary="Safe Account alias")
async def user_safe_account_logout_all(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.auth_service import AuthService
    return await AuthService(db).safe_account_logout_all(current_user, None)

