"""
FaceAuthService — Real Webcam Face Recognition & Verification Service.

Uses OpenCV Haar Cascade classifier to detect human faces in camera images,
normalizes facial regions, and performs template/feature matrix similarity matching.
"""

import base64
import io
import cv2
import numpy as np
from PIL import Image
from fastapi import HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_model import User
from app.models.face_model import FaceCredential
from app.schemas.user_schema import UserOut
from app.utils.jwt_handler import create_access_token, create_refresh_token
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Load OpenCV's pre-trained frontal face Haar Cascade classifier
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
FACE_SIZE = (128, 128)  # Standardized face crop resolution


def _decode_base64_image(base64_str: str) -> np.ndarray:
    """Convert base64 data URL from webcam into an OpenCV BGR image array."""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_bytes = base64.b64decode(base64_str)
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Failed to decode base64 image: {e}")
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Invalid image format received from camera."
        )


def _extract_normalized_face(img: np.ndarray) -> np.ndarray:
    """
    Detect face in image, crop the primary facial region, convert to grayscale,
    equalize histogram for lighting invariance, and resize to 128x128.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = FACE_CASCADE.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=4,
        minSize=(60, 60),
    )

    if len(faces) == 0:
        # Fallback: if Haar cascade missed subtle lighting, attempt center crop
        h, w = gray.shape
        cx, cy = w // 2, h // 2
        sz = min(w, h) // 2
        face_crop = gray[cy - sz: cy + sz, cx - sz: cx + sz]
        if face_crop.size == 0:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "No face detected in camera view. Please center your face in the frame."
            )
    else:
        # Pick the largest detected face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        # Add slight margin around face
        margin = int(w * 0.1)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(gray.shape[1], x + w + margin)
        y2 = min(gray.shape[0], y + h + margin)
        face_crop = gray[y1:y2, x1:x2]

    # Resize to standard size & equalize histogram for illumination invariance
    resized = cv2.resize(face_crop, FACE_SIZE)
    equalized = cv2.equalizeHist(resized)
    return equalized


def _compute_face_similarity(face1: np.ndarray, face2: np.ndarray) -> float:
    """
    Compute similarity score (0.0 to 1.0) between two normalized face crops
    using Normalized Cross-Correlation and Mean Absolute Error.
    """
    if face1.shape != FACE_SIZE or face2.shape != FACE_SIZE:
        face1 = cv2.resize(face1, FACE_SIZE)
        face2 = cv2.resize(face2, FACE_SIZE)

    # Convert to float32 for normalized correlation
    f1 = face1.astype(np.float32)
    f2 = face2.astype(np.float32)

    # Normalized Cross Correlation
    res = cv2.matchTemplate(f1, f2, cv2.TM_CCOEFF_NORMED)
    match_val = float(res[0][0])  # range -1 to 1

    # Mean Absolute Error (MAE) normalized
    mae = np.mean(np.abs(f1 - f2)) / 255.0
    mae_sim = 1.0 - mae

    # Weighted combined similarity score
    score = (match_val * 0.6) + (mae_sim * 0.4)
    return float(max(0.0, score))


class FaceAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_user(self, username: str) -> User:
        from app.models.app_users import PaymentUser, InstagramUser

        result = await self.db.execute(
            select(User).where(or_(User.username == username, User.email == username))
        )
        user = result.scalar_one_or_none()
        if user:
            return user

        # Check mirrors
        res_pay = await self.db.execute(
            select(PaymentUser).where(or_(PaymentUser.username == username, PaymentUser.email == username))
        )
        p_user = res_pay.scalar_one_or_none()
        if p_user:
            m = await self.db.execute(select(User).where(User.id == p_user.id))
            u = m.scalar_one_or_none()
            if u:
                return u

        res_inst = await self.db.execute(
            select(InstagramUser).where(or_(InstagramUser.username == username, InstagramUser.email == username))
        )
        i_user = res_inst.scalar_one_or_none()
        if i_user:
            m = await self.db.execute(select(User).where(User.id == i_user.id))
            u = m.scalar_one_or_none()
            if u:
                return u

        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User '{username}' not found")

    def _tokens(self, user_id: str) -> dict:
        return {
            "access": create_access_token(user_id),
            "refresh": create_refresh_token(user_id),
        }

    async def register_face(self, username: str, base64_image: str) -> dict:
        """Process camera snapshot, detect face, normalize, and store in database."""
        user = await self._get_user(username)
        img = _decode_base64_image(base64_image)
        norm_face = _extract_normalized_face(img)

        # Convert numpy face crop array to bytes for storage
        face_bytes = norm_face.tobytes()

        # Check existing face credential
        res = await self.db.execute(
            select(FaceCredential).where(FaceCredential.user_id == user.id)
        )
        cred = res.scalar_one_or_none()

        if cred:
            cred.face_data = face_bytes
        else:
            cred = FaceCredential(user_id=user.id, face_data=face_bytes)
            self.db.add(cred)

        await self.db.commit()
        logger.info(f"✅ Camera Face profile registered successfully for user '{username}'")
        return {"detail": f"Face profile registered successfully for {username}"}

    async def verify_face(self, username: str, base64_image: str) -> dict:
        """
        Capture live camera snapshot, detect face, and match against stored
        face profile. Accepts login ONLY if similarity threshold is met.
        """
        user = await self._get_user(username)

        # Retrieve stored face profile
        res = await self.db.execute(
            select(FaceCredential).where(FaceCredential.user_id == user.id)
        )
        cred = res.scalar_one_or_none()

        if not cred:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "No face profile registered for this account. Please register your face first."
            )

        # Decode live camera frame
        live_img = _decode_base64_image(base64_image)
        live_face = _extract_normalized_face(live_img)

        # Reconstruct stored face crop from bytes
        stored_face = np.frombuffer(cred.face_data, dtype=np.uint8).reshape(FACE_SIZE)

        # Compute facial similarity score
        similarity = _compute_face_similarity(live_face, stored_face)
        logger.info(f"🔍 Face verification for '{username}': similarity score = {similarity:.2f}")

        # Verification threshold: 0.50 (50% match)
        SIMILARITY_THRESHOLD = 0.50
        if similarity < SIMILARITY_THRESHOLD:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                f"Face verification failed! Face does not match the registered user profile (Match: {int(similarity * 100)}%)."
            )

        # Success — generate JWT session
        tokens = self._tokens(user.id)
        user_out = UserOut.model_validate(user).model_dump()

        clean_username = user.username
        for prefix in ["payment_", "instagram_"]:
            if user.username.startswith(prefix):
                clean_username = user.username[len(prefix):]
                break
        user_out["username"] = clean_username

        logger.info(f"✅ Camera Face authentication successful for '{username}'")
        return {**tokens, "user": user_out, "similarity_score": round(similarity * 100, 1)}
