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
