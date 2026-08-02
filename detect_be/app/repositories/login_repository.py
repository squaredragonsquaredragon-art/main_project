from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from app.models.login_log_model import LoginLog
from datetime import datetime, timedelta, timezone
from typing import Optional


class LoginRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, log: LoginLog) -> LoginLog:
        self.db.add(log)
        await self.db.flush()
        await self.db.refresh(log)
        return log

    def _user_cond(self, user_id: str | list[str]):
        if isinstance(user_id, list):
            return LoginLog.user_id.in_(user_id)
        return LoginLog.user_id == user_id

    def _build_conditions(
        self,
        user_cond=None,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
    ):
        conditions = []
        if user_cond is not None:
            conditions.append(user_cond)
        if source_app and source_app != "all":
            conditions.append(LoginLog.source_app == source_app)
        if event_type and event_type != "all":
            conditions.append(LoginLog.event_type == event_type)
        return and_(*conditions) if conditions else True

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
        for_super_admin: bool = True,
    ) -> tuple[int, list[LoginLog]]:
        """Return logs for ALL users — used by detect_fe monitoring view."""
        conditions = []
        if source_app and source_app != "all":
            conditions.append(LoginLog.source_app == source_app)
        if event_type and event_type != "all":
            conditions.append(LoginLog.event_type == event_type)

        where_clause = and_(*conditions) if conditions else True
        count_q = await self.db.execute(select(func.count()).where(where_clause))
        total = count_q.scalar_one()
        result = await self.db.execute(
            select(LoginLog)
            .where(where_clause)
            .order_by(desc(LoginLog.login_time))
            .offset(skip)
            .limit(limit)
        )
        return total, list(result.scalars().all())

    async def get_by_user(
        self,
        user_id: str | list[str],
        skip: int = 0,
        limit: int = 20,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> tuple[int, list[LoginLog]]:
        cond = self._user_cond(user_id)
        where_clause = self._build_conditions(cond, source_app=source_app, event_type=event_type)
        count_q = await self.db.execute(select(func.count()).where(where_clause))
        total = count_q.scalar_one()
        result = await self.db.execute(
            select(LoginLog)
            .where(where_clause)
            .order_by(desc(LoginLog.login_time))
            .offset(skip)
            .limit(limit)
        )
        return total, list(result.scalars().all())

    async def get_all_paginated(
        self, skip: int = 0, limit: int = 20
    ) -> tuple[int, list[LoginLog]]:
        count_q = await self.db.execute(select(func.count(LoginLog.id)))
        total = count_q.scalar_one()
        result = await self.db.execute(
            select(LoginLog).order_by(desc(LoginLog.login_time)).offset(skip).limit(limit)
        )
        return total, list(result.scalars().all())

    async def count_by_user(self, user_id: str | list[str]) -> int:
        cond = self._user_cond(user_id)
        result = await self.db.execute(select(func.count()).where(cond))
        return result.scalar_one()

    async def count_suspicious_by_user(self, user_id: str | list[str]) -> int:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(func.count()).where(cond, LoginLog.is_suspicious == True)
        )
        return result.scalar_one()

    async def count_all_suspicious(self) -> int:
        result = await self.db.execute(
            select(func.count()).where(LoginLog.is_suspicious == True)
        )
        return result.scalar_one()

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(LoginLog.id)))
        return result.scalar_one()

    async def get_last_login(self, user_id: str | list[str]) -> Optional[LoginLog]:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(LoginLog).where(cond).order_by(desc(LoginLog.login_time)).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_login_trend(self, user_id: str | list[str], days: int = 30) -> list[LoginLog]:
        cond = self._user_cond(user_id)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.db.execute(
            select(LoginLog).where(cond, LoginLog.login_time >= since).order_by(LoginLog.login_time)
        )
        return list(result.scalars().all())

    async def count_recent_failed(self, ip: str, minutes: int = 15) -> int:
        """Count failed/blocked login attempts from this IP in the last N minutes."""
        since = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        result = await self.db.execute(
            select(func.count()).where(
                LoginLog.ip_address == ip,
                # Count both 'failed' event_type AND 'blocked' status entries
                (LoginLog.event_type == "failed") | (LoginLog.status == "blocked"),
                LoginLog.login_time >= since
            )
        )
        return result.scalar_one()

    async def get_recent_ips(self, user_id: str | list[str], limit: int = 10) -> list[str]:
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(LoginLog.ip_address)
            .where(cond)
            .order_by(desc(LoginLog.login_time))
            .limit(limit)
        )
        return [r[0] for r in result.fetchall() if r[0]]

    async def get_recent_browsers(self, user_id: str | list[str], limit: int = 10) -> list[str]:
        """Return distinct browser strings from recent successful logins."""
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(LoginLog.browser)
            .where(cond, LoginLog.event_type == "login", LoginLog.status == "normal")
            .order_by(desc(LoginLog.login_time))
            .limit(limit)
        )
        return [r[0] for r in result.fetchall() if r[0]]

    async def get_recent_devices(self, user_id: str | list[str], limit: int = 10) -> list[str]:
        """Return distinct device/OS strings from recent successful logins."""
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(LoginLog.device)
            .where(cond, LoginLog.event_type == "login", LoginLog.status == "normal")
            .order_by(desc(LoginLog.login_time))
            .limit(limit)
        )
        return [r[0] for r in result.fetchall() if r[0]]

    async def count_user_logins(self, user_id: str | list[str]) -> int:
        """Count total successful logins for this user (used to detect first-ever login)."""
        cond = self._user_cond(user_id)
        result = await self.db.execute(
            select(func.count()).where(cond, LoginLog.event_type == "login")
        )
        return result.scalar_one()

    async def delete_logs(
        self,
        log_ids: Optional[list[str]] = None,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> int:
        from sqlalchemy import delete
        from app.models.suspicious_log_model import SuspiciousLog
        
        conditions = []
        if log_ids:
            conditions.append(LoginLog.id.in_(log_ids))
        else:
            if source_app and source_app != "all":
                conditions.append(LoginLog.source_app == source_app)
            if event_type and event_type != "all":
                conditions.append(LoginLog.event_type == event_type)

        # 1. Select matching IDs to identify related SuspiciousLogs
        stmt_select = select(LoginLog.id)
        if conditions:
            stmt_select = stmt_select.where(and_(*conditions))
            
        select_res = await self.db.execute(stmt_select)
        resolved_ids = [r[0] for r in select_res.fetchall()]

        if not resolved_ids:
            return 0

        # 2. Delete related SuspiciousLogs
        await self.db.execute(
            delete(SuspiciousLog).where(SuspiciousLog.login_log_id.in_(resolved_ids))
        )

        # 3. Delete the LoginLogs
        stmt_del = delete(LoginLog).where(LoginLog.id.in_(resolved_ids))
        res = await self.db.execute(stmt_del)
        await self.db.commit()
        return res.rowcount
