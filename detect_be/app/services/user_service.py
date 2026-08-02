from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.repositories.login_repository import LoginRepository
from app.repositories.alert_repository import AlertRepository
from app.schemas.user_schema import UserOut, UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.login_repo = LoginRepository(db)
        self.alert_repo = AlertRepository(db)

    async def get_me(self, user_id: str) -> UserOut:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        return UserOut.model_validate(user)

    async def update_profile(self, user_id: str, data: UserUpdate) -> UserOut:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

        updates = data.model_dump(exclude_none=True)
        if "username" in updates:
            if await self.user_repo.exists_username(updates["username"]):
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username already taken")
        if "email" in updates:
            if await self.user_repo.exists_email(updates["email"]):
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already in use")

        for key, val in updates.items():
            setattr(user, key, val)
        await self.user_repo.update(user)
        return UserOut.model_validate(user)
