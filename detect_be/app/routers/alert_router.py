from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_model import User
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/", summary="Get all alerts for current user")
async def get_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).get_alerts(current_user.id, page, page_size)


@router.get("/unread-count/", summary="Get unread alert count")
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).get_unread_count(current_user.id)


@router.patch("/{alert_id}/read/", summary="Mark a single alert as read")
async def mark_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).mark_read(alert_id, current_user.id)


@router.post("/mark-all-read/", summary="Mark all alerts as read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).mark_all_read(current_user.id)


@router.get("/all/", summary="Get ALL users' alerts — security monitoring view")
async def get_all_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).get_all_alerts(page, page_size, current_user=current_user)


@router.get("/all/unread-count/", summary="Get all unread alert count")
async def get_all_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AlertService(db).get_all_unread_count(current_user=current_user)
