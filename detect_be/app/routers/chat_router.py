from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.chat_schema import (
    UserSendMessageSchema,
    AdminSendMessageSchema,
    EditMessageSchema,
    ChatMessageOut,
    ConversationSummary,
    UserDetailProfile,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Support Chatbot"])


# ─── Shared / Message Operations ─────────────────────────────────────────────

@router.put("/messages/{message_id}/", summary="Edit a chat message")
async def edit_message(
    message_id: str,
    data: EditMessageSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Edits the text of a previously sent chat message."""
    return await ChatService(db).edit_message(message_id, current_user, data)


@router.delete("/messages/{message_id}/", summary="Delete a chat message")
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft deletes a chat message."""
    return await ChatService(db).delete_message(message_id, current_user)


# ─── User Endpoints ───────────────────────────────────────────────────────────

@router.post("/user/send/", summary="User sends support message to Admin")
async def user_send_message(
    data: UserSendMessageSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """User posts a support chat message / issue inquiry."""
    return await ChatService(db).user_send_message(current_user.id, data)


@router.get("/user/messages/", summary="Fetch chat thread for current user")
async def user_get_messages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves all chat messages between the logged-in user and Admin support."""
    return await ChatService(db).user_get_messages(current_user.id)


# ─── Admin Endpoints ──────────────────────────────────────────────────────────

@router.get("/admin/conversations/", summary="List all user support chat threads")
async def admin_get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists all user support conversations for Admin Portal."""
    return await ChatService(db).admin_get_conversations()


@router.get("/admin/messages/{user_id}/", summary="Fetch chat messages for specific user thread")
async def admin_get_user_messages(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetches chat history for a specific user thread."""
    return await ChatService(db).admin_get_user_messages(user_id)


@router.get("/admin/user-details/{user_id}/", summary="Get user profile and security activity details")
async def admin_get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns rich profile and security activity details for Admin inspection."""
    return await ChatService(db).admin_get_user_profile(user_id)


@router.post("/admin/send/", summary="Admin replies to user support thread")
async def admin_send_message(
    data: AdminSendMessageSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin posts reply message to a user thread."""
    return await ChatService(db).admin_send_message(current_user, data)


@router.get("/admin/unread-count/", summary="Get total unread support messages for Admin badge")
async def admin_get_total_unread(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns unread badge count for Admin sidebar/navbar."""
    return await ChatService(db).admin_get_total_unread()
