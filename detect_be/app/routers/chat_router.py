import json
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form
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
    AIChatSchema,
    UserMovementObserveSchema,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Support Chatbot"])


@router.post("/ai", summary="Chat with AI (OpenAI GPT-4o)")
@router.post("/ai/", summary="Chat with AI (OpenAI GPT-4o)")
@router.post("/admin/ai", summary="Chat with AI (OpenAI GPT-4o)")
@router.post("/admin/ai/", summary="Chat with AI (OpenAI GPT-4o)")
async def chat_with_ai(
    data: AIChatSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sends prompt to OpenAI GPT-4o using OPENAI_API_KEY from backend env."""
    return await ChatService(db).chat_with_ai(data.message, data.history, current_user=current_user)


@router.post("/analyze-file", summary="Threat Detect AI: Analyze CSV/Excel/PDF for Threats")
@router.post("/analyze-file/", summary="Threat Detect AI: Analyze CSV/Excel/PDF for Threats")
@router.post("/admin/analyze-file", summary="Threat Detect AI: Analyze CSV/Excel/PDF for Threats")
@router.post("/admin/analyze-file/", summary="Threat Detect AI: Analyze CSV/Excel/PDF for Threats")
async def analyze_file(
    file: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    history: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Parses uploaded CSV, Excel (.xlsx, .xls) or PDF file and generates a Threat Detection & Security Analysis report."""
    parsed_history = None
    if history:
        try:
            parsed_history = json.loads(history)
        except Exception:
            parsed_history = None

    file_bytes = await file.read()
    return await ChatService(db).analyze_file_for_threats(
        file_bytes=file_bytes,
        filename=file.filename or "uploaded_file",
        user_prompt=prompt,
        history=parsed_history
    )


@router.get("/users-summary", summary="Threat Detect AI: Get Users Activity Summary for Observation")
@router.get("/users-summary/", summary="Threat Detect AI: Get Users Activity Summary for Observation")
@router.get("/admin/users-summary", summary="Threat Detect AI: Get Users Activity Summary for Observation")
@router.get("/admin/users-summary/", summary="Threat Detect AI: Get Users Activity Summary for Observation")
async def get_users_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns list of users with their login event counts, alert counts, and latest activity."""
    return await ChatService(db).get_users_for_observation(current_user=current_user)


@router.post("/observe-user-movement", summary="Threat Detect AI: Observe and Analyze User Movement")
@router.post("/observe-user-movement/", summary="Threat Detect AI: Observe and Analyze User Movement")
@router.post("/admin/observe-user-movement", summary="Threat Detect AI: Observe and Analyze User Movement")
@router.post("/admin/observe-user-movement/", summary="Threat Detect AI: Observe and Analyze User Movement")
async def observe_user_movement(
    data: UserMovementObserveSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Directly conducts forensic analysis of user activity and movement from the database."""
    return await ChatService(db).observe_user_movement(data.target_user, data.prompt, data.history, current_user=current_user)





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
