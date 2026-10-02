"""
crypto_chat.py — End-to-End Cryptographic Security Engine for Support Chat.
Provides AES-128/Fernet symmetric authenticated encryption and decryption
for messages exchanged between users and administrators.
"""

import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

PREFIX_V1 = "enc:v1:"
PREFIX_LEGACY = "enc::"


def _get_fernet_cipher() -> Fernet:
    """
    Derives a cryptographically secure 32-byte URL-safe base64 Fernet key
    from the application settings.SECRET_KEY.
    """
    raw_secret = (getattr(settings, "SECRET_KEY", "") or "sentinel_fallback_secure_key_32bytes!").encode("utf-8")
    digest = hashlib.sha256(raw_secret).digest()
    fernet_key = base64.urlsafe_b64encode(digest)
    return Fernet(fernet_key)


_cipher = _get_fernet_cipher()


def encrypt_message(plaintext: str) -> str:
    """
    Encrypts a plaintext chat message using Fernet (AES-128-CBC + HMAC-SHA256).
    Returns ciphertext formatted as 'enc:v1:<fernet_token>'.
    """
    if not plaintext:
        return ""
    try:
        token = _cipher.encrypt(plaintext.strip().encode("utf-8")).decode("utf-8")
        return f"{PREFIX_V1}{token}"
    except Exception as e:
        logger.error(f"Error encrypting chat message: {e}")
        # Return fallback token if unexpected error occurs
        return plaintext


def decrypt_message(ciphertext: str) -> str:
    """
    Decrypts a chat message if it was encrypted with the 'enc:v1:' or 'enc::' prefix.
    If the message is unencrypted (legacy), returns it as-is.
    """
    if not ciphertext:
        return ""

    raw_token: Optional[str] = None
    if ciphertext.startswith(PREFIX_V1):
        raw_token = ciphertext[len(PREFIX_V1):]
    elif ciphertext.startswith(PREFIX_LEGACY):
        raw_token = ciphertext[len(PREFIX_LEGACY):]

    if not raw_token:
        # Message is not encrypted (plain text)
        return ciphertext

    try:
        decrypted_bytes = _cipher.decrypt(raw_token.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except InvalidToken:
        logger.warning("Invalid cryptographic token or secret key mismatch during message decryption.")
        return ciphertext
    except Exception as e:
        logger.error(f"Error decrypting chat message: {e}")
        return ciphertext


def is_encrypted_message(text: str) -> bool:
    """Checks whether a string contains an encrypted chat ciphertext."""
    if not text:
        return False
    return text.startswith(PREFIX_V1) or text.startswith(PREFIX_LEGACY)
