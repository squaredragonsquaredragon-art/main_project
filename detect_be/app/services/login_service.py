from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.repositories.login_repository import LoginRepository
from app.schemas.login_schema import LoginHistoryResponse, LoginLogOut


# Map activity_type display name → source_app slug
_ACTIVITY_TYPE_TO_APP = {
    "apex pay": "payment",
    "instaglance": "instagram",
    "payment": "payment",
    "instagram": "instagram",
}


def _derive_source_app(activity_type: str, explicit: Optional[str] = None) -> str:
    if explicit and explicit in ("payment", "instagram", "system"):
        return explicit
    key = activity_type.lower().strip()
    return _ACTIVITY_TYPE_TO_APP.get(key, "system")


class LoginService:
    def __init__(self, db: AsyncSession):
        self.login_repo = LoginRepository(db)

    async def _resolve_user_ids(self, user_id: str) -> list[str]:
        from app.models.user_model import User
        from sqlalchemy import select

        result = await self.login_repo.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return [user_id]

        username = user.username
        base_name = username
        for prefix in ["payment_", "instagram_"]:
            if username.startswith(prefix):
                base_name = username[len(prefix):]
                break

        target_usernames = [
            base_name,
            f"payment_{base_name}",
            f"instagram_{base_name}",
        ]
        res = await self.login_repo.db.execute(
            select(User.id).where(User.username.in_(target_usernames))
        )
        return [r[0] for r in res.fetchall()]

    async def get_history(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> LoginHistoryResponse:
        user_ids = await self._resolve_user_ids(user_id)
        skip = (page - 1) * page_size
        total, logs = await self.login_repo.get_by_user(
            user_ids, skip, page_size, source_app=source_app, event_type=event_type
        )
        return LoginHistoryResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[LoginLogOut.model_validate(l) for l in logs],
        )

    async def get_all_history(
        self,
        page: int = 1,
        page_size: int = 20,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
        current_user: Optional[object] = None,
    ) -> LoginHistoryResponse:
        """Returns ALL users' logs — used by detect_fe security monitoring dashboard."""
        skip = (page - 1) * page_size
        
        # Verify if request is from super admin 'qwer1234'
        is_super_admin = getattr(current_user, "username", "") == "qwer1234"
        
        total, logs = await self.login_repo.get_all(
            skip, page_size, source_app=source_app, event_type=event_type, for_super_admin=is_super_admin
        )
        return LoginHistoryResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=[LoginLogOut.model_validate(l) for l in logs],
        )

    async def get_dashboard_stats(self, user_id: str) -> dict:
        user_ids = await self._resolve_user_ids(user_id)
        total = await self.login_repo.count_by_user(user_ids)
        suspicious = await self.login_repo.count_suspicious_by_user(user_ids)
        last = await self.login_repo.get_last_login(user_ids)
        return {
            "total_logins": total,
            "suspicious_attempts": suspicious,
            "last_login": last.login_time if last else None,
        }

    async def get_all_stats(self) -> dict:
        """System-wide stats for detect_fe monitoring dashboard."""
        total = await self.login_repo.count_all()
        suspicious = await self.login_repo.count_all_suspicious()
        return {
            "total_logins": total,
            "suspicious_attempts": suspicious,
            "last_login": None,
        }

    async def get_trend(self, user_id: str, days: int = 30) -> list:
        user_ids = await self._resolve_user_ids(user_id)
        logs = await self.login_repo.get_login_trend(user_ids, days)
        from collections import defaultdict
        daily: dict = defaultdict(lambda: {"normal": 0, "suspicious": 0})
        for log in logs:
            day = log.login_time.date().isoformat()
            if log.is_suspicious:
                daily[day]["suspicious"] += 1
            else:
                daily[day]["normal"] += 1
        return [{"date": d, **v} for d, v in sorted(daily.items())]

    async def create_activity_log(
        self,
        user_id: str,
        activity_type: str,
        action: str,
        description: str,
        request,
        source_app: Optional[str] = None,
    ) -> dict:
        from app.utils.device_parser import parse_user_agent
        from app.models.login_log_model import LoginLog
        from app.services.auth_service import AuthService
        from app.models.user_model import User
        from sqlalchemy import select

        ua_string = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua_string)
        ip = AuthService._get_ip(request)
        resolved_app = _derive_source_app(activity_type, source_app)

        # Get username for display
        res = await self.login_repo.db.execute(select(User).where(User.id == user_id))
        user = res.scalar_one_or_none()
        display_username = user.username if user else ""
        # Strip app prefix for display
        for prefix in ["payment_", "instagram_"]:
            if display_username.startswith(prefix):
                display_username = display_username[len(prefix):]
                break

        log = LoginLog(
            user_id=user_id,
            username=display_username,
            ip_address=ip,
            user_agent=ua_string,
            browser=activity_type,
            os=action,
            device=device_info["device"],
            location=description,
            source_app=resolved_app,
            event_type="activity",
            status="normal",
            is_suspicious=False,
            risk_score=0.0,
        )
        await self.login_repo.create(log)
        return {"status": "success", "detail": "Activity logged successfully", "source_app": resolved_app}

    async def delete_history_logs(
        self,
        log_ids: Optional[list[str]] = None,
        source_app: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> int:
        return await self.login_repo.delete_logs(
            log_ids=log_ids, source_app=source_app, event_type=event_type
        )
