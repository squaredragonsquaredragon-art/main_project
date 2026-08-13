from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.face_schema import FaceRegisterRequest, FaceVerifyRequest
from app.services.face_auth_service import FaceAuthService

router = APIRouter(prefix="/face", tags=["Face Recognition"])


@router.post("/register/", summary="Register user face profile via webcam camera snapshot")
async def register_face(
    data: FaceRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives base64 camera image from webcam during registration.
    Detects face, normalizes features, and stores face profile in database.
    """
    return await FaceAuthService(db).register_face(data.username, data.face_image)


@router.post("/verify/", summary="Authenticate user by scanning face with webcam")
async def verify_face(
    data: FaceVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Receives live webcam snapshot during face login attempt.
    Detects face, compares against stored face profile in database.
    If face matches -> returns JWT tokens.
    If face does NOT match -> denies access (HTTP 401).
    """
    return await FaceAuthService(db).verify_face(data.username, data.face_image)
