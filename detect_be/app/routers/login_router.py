from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_model import User
from app.services.login_service import LoginService


class ActivitySchema(BaseModel):
    activity_type: str   # e.g., "Apex Pay", "InstaGlance"
    action: str          # e.g., "Fund Transfer", "Like Post"
    description: str     # e.g., "Transferred $50 to Bob"
    source_app: Optional[str] = None  # explicit: payment | instagram | system


router = APIRouter(prefix="/login-history", tags=["Login History"])


# ─── User-scoped (super-app use) ────────────────────────────────────────────

@router.get("/", summary="Get current user's login history")
async def get_login_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source_app: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LoginService(db).get_history(
        current_user.id, page, page_size, source_app=source_app, event_type=event_type
    )


@router.get("/trend/", summary="Get login trend data")
async def get_login_trend(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LoginService(db).get_trend(current_user.id, days)


@router.get("/stats/", summary="Get login statistics for dashboard")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LoginService(db).get_dashboard_stats(current_user.id)


@router.post("/activity/", summary="Log user app activity")
async def log_activity(
    data: ActivitySchema,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LoginService(db).create_activity_log(
        user_id=current_user.id,
        activity_type=data.activity_type,
        action=data.action,
        description=data.description,
        source_app=data.source_app,
        request=request,
    )


# ─── System-wide monitoring (detect_fe use) ─────────────────────────────────

@router.get("/all/", summary="Get ALL users' login history — security monitoring view")
async def get_all_login_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    source_app: Optional[str] = Query(None, description="Filter by app: payment | instagram | system"),
    event_type: Optional[str] = Query(None, description="Filter by event: register | login | failed | activity"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns activity for ALL users across all apps. Used by detect_fe security monitor."""
    return await LoginService(db).get_all_history(
        page, page_size, source_app=source_app, event_type=event_type, current_user=current_user
    )


@router.get("/all/stats/", summary="Get system-wide login stats for detect_fe")
async def get_all_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LoginService(db).get_all_stats()


class DeleteLogsSchema(BaseModel):
    log_ids: Optional[list[str]] = None
    source_app: Optional[str] = None
    event_type: Optional[str] = None


@router.delete("/delete/", summary="Delete selected or filtered logs")
async def delete_logs(
    data: DeleteLogsSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted_count = await LoginService(db).delete_history_logs(
        log_ids=data.log_ids,
        source_app=data.source_app,
        event_type=data.event_type,
    )
    return {"status": "success", "deleted_count": deleted_count}
