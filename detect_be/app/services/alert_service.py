from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.alert_repository import AlertRepository
from app.schemas.alert_schema import AlertOut, AlertsResponse


class AlertService:
    def __init__(self, db: AsyncSession):
        self.alert_repo = AlertRepository(db)

    async def _resolve_user_ids(self, user_id: str) -> list[str]:
        from app.models.user_model import User
        from sqlalchemy import select
        
        result = await self.alert_repo.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return [user_id]
            
        username = user.username
        base_name = username
        for prefix in ["payment_", "instagram_", "ecommerce_"]:
            if username.startswith(prefix):
                base_name = username[len(prefix):]
                break
                
        target_usernames = [
            base_name,
            f"payment_{base_name}",
            f"instagram_{base_name}",
            f"ecommerce_{base_name}",
        ]
        
        res = await self.alert_repo.db.execute(
            select(User.id).where(User.username.in_(target_usernames))
        )
        return [r[0] for r in res.fetchall()]

    async def get_alerts(
        self, user_id: str, page: int = 1, page_size: int = 20
    ) -> AlertsResponse:
        user_ids = await self._resolve_user_ids(user_id)
        skip = (page - 1) * page_size
        total, unread, alerts = await self.alert_repo.get_alerts_by_user(
            user_ids, skip, page_size
        )
        return AlertsResponse(
            total=total,
            unread=unread,
            items=[AlertOut.model_validate(a) for a in alerts],
        )

    async def mark_read(self, alert_id: str, user_id: str) -> dict:
        user_ids = await self._resolve_user_ids(user_id)
        success = await self.alert_repo.mark_read(alert_id, user_ids)
        if not success:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Alert not found")
        return {"detail": "Alert marked as read"}

    async def mark_all_read(self, user_id: str) -> dict:
        user_ids = await self._resolve_user_ids(user_id)
        await self.alert_repo.mark_all_read(user_ids)
        return {"detail": "All alerts marked as read"}

    async def get_unread_count(self, user_id: str) -> dict:
        user_ids = await self._resolve_user_ids(user_id)
        count = await self.alert_repo.get_unread_count(user_ids)
        return {"unread_count": count}

    async def get_all_alerts(
        self, page: int = 1, page_size: int = 20, current_user: object = None
    ) -> AlertsResponse:
        skip = (page - 1) * page_size
        is_super_admin = getattr(current_user, "username", "") == "qwer1234"
        
        total, unread, alerts = await self.alert_repo.get_all_alerts_paginated(
            skip, page_size, for_super_admin=is_super_admin, user_id=getattr(current_user, "id", None)
        )
        return AlertsResponse(
            total=total,
            unread=unread,
            items=[AlertOut.model_validate(a) for a in alerts],
        )

    async def get_all_unread_count(self, current_user: object = None) -> dict:
        is_super_admin = getattr(current_user, "username", "") == "qwer1234"
        count = await self.alert_repo.get_all_unread_count(
            for_super_admin=is_super_admin, user_id=getattr(current_user, "id", None)
        )
        return {"unread_count": count}
