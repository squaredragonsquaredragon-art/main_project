from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from app.models.suspicious_log_model import SuspiciousLog
from datetime import datetime, timezone


class AlertRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_suspicious(self, log: SuspiciousLog) -> SuspiciousLog:
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log

    def _user_cond(self, user_id: str | list[str]):
        if isinstance(user_id, list):
            return SuspiciousLog.user_id.in_(user_id)
        return SuspiciousLog.user_id == user_id

    async def get_alerts_by_user(
        self, user_id: str | list[str], skip: int = 0, limit: int = 20
    ) -> tuple[int, int, list[SuspiciousLog]]:
        cond = self._user_cond(user_id)
        count_q = await self.db.execute(
            select(func.count()).where(cond)
        )
        total = count_q.scalar_one()
        unread_q = await self.db.execute(
            select(func.count()).where(
                cond, SuspiciousLog.is_read == False
            )
        )
        unread = unread_q.scalar_one()
        result = await self.db.execute(
            select(SuspiciousLog)
            .where(cond)
            .order_by(desc(SuspiciousLog.created_at))
            .offset(skip)
            .limit(limit)
        )
        return total, unread, list(result.scalars().all())

    async def get_all_alerts_paginated(
        self, skip: int = 0, limit: int = 20, for_super_admin: bool = True, user_id: str = None
    ) -> tuple[int, int, list[SuspiciousLog]]:
        conditions = []
        if not for_super_admin and user_id:
            conditions.append(SuspiciousLog.user_id == user_id)
            
        where_clause = and_(*conditions) if conditions else True

        count_q = await self.db.execute(
            select(func.count(SuspiciousLog.id)).where(where_clause)
        )
        total = count_q.scalar_one()
        unread_q = await self.db.execute(
            select(func.count(SuspiciousLog.id)).where(
                where_clause, SuspiciousLog.is_read == False
            )
        )
        unread = unread_q.scalar_one()
        result = await self.db.execute(
            select(SuspiciousLog)
            .where(where_clause)
            .order_by(desc(SuspiciousLog.created_at))
            .offset(skip)
            .limit(limit)
        )
        return total, unread, list(result.scalars().all())

    async def get_all_unread_count(self, for_super_admin: bool = True, user_id: str = None) -> int:
        conditions = []
        if not for_super_admin and user_id:
            conditions.append(SuspiciousLog.user_id == user_id)
            
        where_clause = and_(*conditions) if conditions else True

        result = await self.db.execute(
            select(func.count(SuspiciousLog.id)).where(
                where_clause, SuspiciousLog.is_read == False
            )
        )
        return result.scalar_one()

    async def mark_read(self, alert_id: str, user_id: str | list[str]) -> bool:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(SuspiciousLog).where(
                SuspiciousLog.id == alert_id, cond
            )
        )
        alert = result.scalar_one_or_none()
        if alert:
            alert.is_read = True
            await self.db.flush()
            return True
        return False

    async def mark_all_read(self, user_id: str | list[str]) -> None:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(SuspiciousLog).where(
                cond, SuspiciousLog.is_read == False
            )
        )
        for alert in result.scalars().all():
            alert.is_read = True
        await self.db.flush()

    async def get_unread_count(self, user_id: str | list[str]) -> int:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(func.count()).where(
                cond, SuspiciousLog.is_read == False
            )
        )
        return result.scalar_one()

