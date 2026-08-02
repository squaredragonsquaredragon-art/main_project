from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_admin_user, get_super_admin_user
from app.models.user_model import User
from app.services.admin_service import AdminService
from app.schemas.user_schema import UserAdminUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users/", summary="List all users (super admin)")
async def list_users(
    admin: User = Depends(get_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_all_users()


@router.patch("/users/{user_id}/", summary="Update any user (super admin)")
async def update_user(
    user_id: str,
    data: UserAdminUpdate,
    admin: User = Depends(get_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).update_user(user_id, data)


@router.get("/stats/", summary="Get system-wide statistics (admin)")
async def system_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_system_stats()


@router.get("/alerts/", summary="Get all suspicious alerts (admin)")
async def all_alerts(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_all_alerts(current_user=admin)


@router.delete("/users/{user_id}/", summary="Delete a user account (admin)")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).delete_user(user_id)
