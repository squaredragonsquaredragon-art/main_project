from pydantic import BaseModel


class FaceRegisterRequest(BaseModel):
    username: str
    face_image: str  # Base64 data URL from webcam (e.g. "data:image/jpeg;base64,...")


class FaceVerifyRequest(BaseModel):
    username: str
    face_image: str  # Base64 data URL from webcam
