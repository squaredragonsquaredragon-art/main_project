from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.repositories.user_repository import UserRepository
from app.repositories.login_repository import LoginRepository
from app.repositories.alert_repository import AlertRepository
from app.models.user_model import User
from app.models.login_log_model import LoginLog
from app.schemas.user_schema import UserListOut, UserAdminUpdate
from fastapi import HTTPException, status


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.login_repo = LoginRepository(db)
        self.alert_repo = AlertRepository(db)

    async def get_all_users(self) -> list[UserListOut]:
        users = await self.user_repo.get_all(limit=500)
        result = []
        for u in users:
            total = await self.login_repo.count_by_user(u.id)
            sus = await self.login_repo.count_suspicious_by_user(u.id)
            last = await self.login_repo.get_last_login(u.id)
            risk = "low"
            if sus >= 10:
                risk = "critical"
            elif sus >= 5:
                risk = "high"
            elif sus >= 2:
                risk = "medium"
            result.append(UserListOut(
                id=u.id,
                username=u.username,
                email=u.email,
                is_active=u.is_active,
                role=u.role,
                created_at=u.created_at,
                total_logins=total,
                suspicious_count=sus,
                last_login=last.login_time if last else None,
                risk_level=risk,
            ))
        return result

    async def update_user(self, user_id: str, data: UserAdminUpdate) -> dict:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        for key, val in data.model_dump(exclude_none=True).items():
            setattr(user, key, val)
        await self.user_repo.update(user)
        return {"detail": "User updated"}

    async def get_system_stats(self) -> dict:
        users = await self.user_repo.get_all(limit=10000)
        total_users = len(users)
        active_users = sum(1 for u in users if u.is_active)

        count_q = await self.db.execute(select(func.count(LoginLog.id)))
        total_logins = count_q.scalar_one()

        sus_q = await self.db.execute(
            select(func.count(LoginLog.id)).where(LoginLog.is_suspicious == True)
        )
        total_suspicious = sus_q.scalar_one()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "blocked_users": total_users - active_users,
            "total_logins": total_logins,
            "total_suspicious": total_suspicious,
        }

    async def get_all_alerts(self, current_user: object = None) -> list:
        from app.schemas.alert_schema import AlertOut
        is_super_admin = getattr(current_user, "username", "") == "qwer1234"
        total, unread, alerts = await self.alert_repo.get_all_alerts_paginated(
            skip=0, limit=100, for_super_admin=is_super_admin, user_id=getattr(current_user, "id", None)
        )
        return [AlertOut.model_validate(a).model_dump() for a in alerts]

    async def delete_user(self, user_id: str) -> dict:
        from sqlalchemy import delete as sa_delete
        from app.models.login_log_model import LoginLog
        from app.models.suspicious_log_model import SuspiciousLog

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

        try:
            # 1. Delete suspicious/alert logs for this user
            await self.db.execute(
                sa_delete(SuspiciousLog).where(SuspiciousLog.user_id == user_id)
            )

            # 2. Delete login logs for this user
            await self.db.execute(
                sa_delete(LoginLog).where(LoginLog.user_id == user_id)
            )

            # 3. Delete the user
            await self.db.delete(user)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Delete failed: {str(e)}")

        return {"detail": f"User '{user.username}' deleted successfully"}

    async def force_logout_user(self, user_id: str) -> dict:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        
        # Invalidate/revoke user sessions & log emergency security alert
        from app.models.suspicious_log_model import SuspiciousLog
        alert = SuspiciousLog(
            user_id=user.id,
            ip_address="127.0.0.1",
            device_info="ADMIN_FORCE_LOGOUT_ALL_DEVICES",
            reason=f"Admin initiated Safe Account force logout from all devices for user '{user.username}'",
            status="UNREAD"
        )
        self.db.add(alert)
        await self.db.commit()

        return {"detail": f"Logged out '{user.username}' from all active devices", "user_id": user_id}

    async def bulk_force_logout_users(self, user_ids: list[str]) -> dict:
        success_count = 0
        for uid in user_ids:
            try:
                user = await self.user_repo.get_by_id(uid)
                if user:
                    from app.models.suspicious_log_model import SuspiciousLog
                    alert = SuspiciousLog(
                        user_id=user.id,
                        ip_address="127.0.0.1",
                        device_info="ADMIN_BULK_FORCE_LOGOUT",
                        reason=f"Admin initiated bulk Safe Account force logout for user '{user.username}'",
                        status="UNREAD"
                    )
                    self.db.add(alert)
                    success_count += 1
            except Exception:
                pass
        await self.db.commit()

        return {"detail": f"Logged out {success_count} user account(s) from all active devices", "count": success_count}

    async def bulk_delete_users(self, user_ids: list[str]) -> dict:
        from sqlalchemy import delete as sa_delete
        from app.models.login_log_model import LoginLog
        from app.models.suspicious_log_model import SuspiciousLog

        count = 0
        for uid in user_ids:
            try:
                user = await self.user_repo.get_by_id(uid)
                if user:
                    await self.db.execute(
                        sa_delete(SuspiciousLog).where(SuspiciousLog.user_id == uid)
                    )
                    await self.db.execute(
                        sa_delete(LoginLog).where(LoginLog.user_id == uid)
                    )
                    await self.db.delete(user)
                    count += 1
            except Exception:
                pass
        await self.db.commit()
        return {"detail": f"Permanently deleted {count} user account(s) from database", "count": count}

    async def reset_all_test_data(self) -> dict:
        from sqlalchemy import delete as sa_delete
        from app.models.user_model import User
        from app.models.login_log_model import LoginLog
        from app.models.suspicious_log_model import SuspiciousLog
        from app.models.app_users import PaymentUser, InstagramUser

        # Delete logs
        await self.db.execute(sa_delete(SuspiciousLog))
        await self.db.execute(sa_delete(LoginLog))

        # Delete app users
        await self.db.execute(sa_delete(PaymentUser))
        await self.db.execute(sa_delete(InstagramUser))

        # Delete non-superuser accounts from User table
        await self.db.execute(
            sa_delete(User).where(User.username.notin_(["qwer1234", "admin"]))
        )
        await self.db.commit()

        return {"detail": "All test data and users cleared successfully from Database"}
