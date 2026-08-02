import asyncio
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def send_whatsapp_alert(
    to_phone: str,
    username: str,
    ip_address: str,
    location: str,
    app_name: str,
    failed_count: int,
    is_locked: bool = False,
) -> bool:
    """
    Send a WhatsApp security alert to the target user when someone tries wrong passwords.

    Uses Twilio WhatsApp API. If Twilio is not configured, logs a warning and returns False.
    To use Twilio Sandbox: the recipient must first send 'join <sandbox-keyword>'
    to the Twilio sandbox number (+14155238886).
    """
    if not to_phone:
        logger.warning("WhatsApp alert skipped — no phone number on record for this user.")
        return False

    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        # Graceful degradation: just log if Twilio not configured
        logger.warning(
            f"[WhatsApp MOCK] Security alert for @{username} → {to_phone} | "
            f"Failed attempts: {failed_count} | IP: {ip_address} | Location: {location} | "
            f"App: {app_name} | Locked: {is_locked}"
        )
        return False

    # Normalize phone number to E.164 international format
    normalized = to_phone.strip().replace(" ", "").replace("-", "")
    if normalized.startswith("whatsapp:"):
        normalized = normalized[len("whatsapp:"):]
    # If 10-digit Indian number without country code, add +91
    if len(normalized) == 10 and normalized.isdigit():
        normalized = f"+91{normalized}"
    # If starts with 91 and is 12 digits (no +), add +
    elif len(normalized) == 12 and normalized.startswith("91"):
        normalized = f"+{normalized}"
    # Ensure it starts with +
    elif not normalized.startswith("+"):
        normalized = f"+{normalized}"

    to_number = f"whatsapp:{normalized}"

    lock_msg = (
        "\n🔒 *Your account has been AUTO-LOCKED for safety.* Please wait 5 minutes or contact support."
        if is_locked else
        f"\n⚠️ After {failed_count} wrong attempts, your account will be locked automatically."
    )

    message_body = (
        f"🚨 *SentinelAI Security Alert*\n\n"
        f"Hi *{username}*, someone is trying to access your account with wrong passwords!\n\n"
        f"🔐 *App:* {app_name}\n"
        f"📍 *Location:* {location}\n"
        f"🌐 *Hacker IP:* `{ip_address}`\n"
        f"❌ *Wrong Attempts:* {failed_count}\n"
        f"{lock_msg}\n\n"
        f"If this is you, ignore this message. Otherwise, secure your account immediately! 🛡️"
    )

    def _send_via_twilio(from_num: str):
        from twilio.rest import Client  # type: ignore
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message_body,
            from_=from_num,
            to=to_number,
        )
        return message.sid

    try:
        loop = asyncio.get_event_loop()
        from_sender = settings.TWILIO_WHATSAPP_FROM or "whatsapp:+14155238886"
        if not from_sender.startswith("whatsapp:"):
            from_sender = f"whatsapp:{from_sender}"

        try:
            sid = await loop.run_in_executor(None, _send_via_twilio, from_sender)
            logger.info(f"✅ WhatsApp alert sent from {from_sender} to {to_number} for @{username} — SID: {sid}")
            return True
        except Exception as primary_err:
            if from_sender != "whatsapp:+14155238886":
                logger.warning(f"Primary WhatsApp sender {from_sender} failed: {primary_err}. Retrying via Twilio Sandbox (+14155238886)...")
                sid = await loop.run_in_executor(None, _send_via_twilio, "whatsapp:+14155238886")
                logger.info(f"✅ WhatsApp alert sent via Sandbox to {to_number} for @{username} — SID: {sid}")
                return True
            raise primary_err
    except Exception as e:
        err_str = str(e)
        logger.error(f"❌ WhatsApp alert failed for @{username} ({to_number}): {err_str}")
        if "401" in err_str or "Authenticate" in err_str:
            logger.warning(
                "💡 [TWILIO AUTH 401 ERROR] The TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in detect_be/.env is invalid or expired.\n"
                "   Please copy your active Account SID and Auth Token from https://console.twilio.com into detect_be/.env!"
            )
        return False
