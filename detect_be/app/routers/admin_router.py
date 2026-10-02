from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_admin_user, get_super_admin_user
from app.models.user_model import User
from app.services.admin_service import AdminService
from app.schemas.user_schema import UserAdminUpdate
from typing import Optional

router = APIRouter(prefix="/admin", tags=["Admin"])



@router.get("/users/", summary="List all users (admin)")
@router.get("/users", summary="List all users (admin)")
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_all_users()


@router.get("/users/{user_id}/history/export/", summary="Export a specific user's login history (admin)")
@router.get("/users/{user_id}/history/export", summary="Export a specific user's login history (admin)")
async def export_user_history(
    user_id: str,
    start_date: Optional[str] = Query(None, description="ISO datetime string for range start (e.g. 2026-07-01T00:00:00)"),
    end_date: Optional[str] = Query(None, description="ISO datetime string for range end (e.g. 2026-10-01T23:59:59)"),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns ALL login history records for a specific user within the given date range."""
    return await AdminService(db).get_user_history_export(user_id, start_date, end_date)


@router.post("/users/bulk-force-logout/", summary="Bulk force logout multiple users (admin)")
@router.post("/users/bulk-force-logout", summary="Bulk force logout multiple users (admin)")
@router.post("/bulk-force-logout/", summary="Bulk force logout multiple users (admin)")
@router.post("/bulk-force-logout", summary="Bulk force logout multiple users (admin)")
async def bulk_force_logout_users(
    payload: dict = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    payload = payload or {}
    user_ids = payload.get("user_ids", [])
    return await AdminService(db).bulk_force_logout_users(user_ids)


@router.post("/users/bulk-delete/", summary="Bulk delete multiple user accounts permanently (admin)")
@router.post("/users/bulk-delete", summary="Bulk delete multiple user accounts permanently (admin)")
@router.delete("/users/bulk-delete/", summary="Bulk delete multiple user accounts permanently (admin)")
@router.delete("/users/bulk-delete", summary="Bulk delete multiple user accounts permanently (admin)")
@router.post("/bulk-delete-users/", summary="Bulk delete multiple user accounts permanently (admin)")
@router.post("/bulk-delete-users", summary="Bulk delete multiple user accounts permanently (admin)")
async def bulk_delete_users(
    payload: dict = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    payload = payload or {}
    user_ids = payload.get("user_ids", [])
    return await AdminService(db).bulk_delete_users(user_ids)


@router.post("/reset-all-data/", summary="Clear all test data (admin)")
@router.post("/reset-all-data", summary="Clear all test data (admin)")
async def reset_all_test_data(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).reset_all_test_data()


@router.patch("/users/{user_id}/", summary="Update any user (super admin)")
@router.patch("/users/{user_id}", summary="Update any user (super admin)")
async def update_user(
    user_id: str,
    data: UserAdminUpdate,
    admin: User = Depends(get_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id in ("bulk-delete", "bulk-force-logout"):
        raise HTTPException(400, "Invalid user ID")
    return await AdminService(db).update_user(user_id, data)


@router.get("/stats/", summary="Get system-wide statistics (admin)")
@router.get("/stats", summary="Get system-wide statistics (admin)")
async def system_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_system_stats()


@router.get("/alerts/", summary="Get all suspicious alerts (admin)")
@router.get("/alerts", summary="Get all suspicious alerts (admin)")
async def all_alerts(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).get_all_alerts(current_user=admin)


@router.delete("/users/{user_id}/", summary="Delete a user account (admin)")
@router.delete("/users/{user_id}", summary="Delete a user account (admin)")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id in ("bulk-delete", "bulk-force-logout"):
        return await AdminService(db).bulk_delete_users([])
    return await AdminService(db).delete_user(user_id)


@router.post("/users/{user_id}/force-logout/", summary="Force logout user from all devices (admin)")
@router.post("/users/{user_id}/force-logout", summary="Force logout user from all devices (admin)")
async def force_logout_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id in ("bulk-delete", "bulk-force-logout"):
        return await AdminService(db).bulk_force_logout_users([])
    return await AdminService(db).force_logout_user(user_id)
