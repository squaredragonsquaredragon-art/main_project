import smtplib
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email asynchronously using SMTP."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — email not sent.")
        return False

    def _send():
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SentinelAI <{settings.SMTP_USER}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.sendmail(settings.SMTP_USER, to, msg.as_string())

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send)
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False





async def send_suspicious_login_alert(to: str, username: str, ip: str, location: str, browser: str) -> bool:
    html = f"""
    <div style="font-family:Inter,sans-serif;background:#060b18;padding:40px;border-radius:16px;color:#e2e8f0;max-width:500px;margin:0 auto;">
      <h2 style="color:#ef4444;margin-bottom:8px;">⚠️ Suspicious Login Detected</h2>
      <p>Hi <strong>{username}</strong>, we detected a suspicious login to your account.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:0.9rem;">
        <tr><td style="padding:8px;color:#94a3b8;">IP Address</td><td style="padding:8px;font-family:monospace;color:#60a5fa;">{ip}</td></tr>
        <tr><td style="padding:8px;color:#94a3b8;">Location</td><td style="padding:8px;color:#e2e8f0;">{location}</td></tr>
        <tr><td style="padding:8px;color:#94a3b8;">Browser</td><td style="padding:8px;color:#e2e8f0;">{browser}</td></tr>
      </table>
      <p style="color:#94a3b8;font-size:0.85rem;">If this was you, no action is needed. Otherwise, change your password immediately.</p>
    </div>
    """
    return await send_email(to, "SentinelAI — Suspicious Login Alert", html)


async def send_brute_force_alert(
    to: str,
    username: str,
    ip: str,
    location: str,
    app_name: str,
    failed_count: int,
    is_locked: bool = False,
) -> bool:
    lock_section = ""
    if is_locked:
        lock_section = """
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px 16px;margin:20px 0;color:#fca5a5;font-size:0.9rem;display:flex;align-items:center;gap:10px;">
          <span>🔒</span>
          <strong>Your account has been AUTO-LOCKED for safety.</strong> Please wait 5 minutes or contact support.
        </div>
        """
    else:
        lock_section = f"""
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px 16px;margin:20px 0;color:#fcd34d;font-size:0.9rem;">
          ⚠️ After {failed_count} wrong attempts, your account will be locked automatically.
        </div>
        """

    html = f"""
    <div style="font-family:'Inter', sans-serif; background:#060b18; padding:40px; border-radius:16px; color:#e2e8f0; max-width:500px; margin:0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 3rem;">🚨</span>
        <h2 style="color:#ef4444; margin:10px 0 4px 0; font-size: 1.5rem; font-weight: 700;">SentinelAI Security Alert</h2>
        <p style="color:#94a3b8; margin:0; font-size: 0.9rem;">Repeated Login Failures Detected</p>
      </div>
      
      <p>Hi <strong>{username}</strong>,</p>
      <p>Someone is attempting to access your account on the <strong>{app_name}</strong> portal using incorrect passwords.</p>
      
      <div style="background:#0f1b2e; border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:20px; margin:20px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px 0; color:#94a3b8; font-weight: 500;">Application</td>
            <td style="padding:10px 0; font-weight: 600; color:#e2e8f0; text-align: right;">{app_name}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px 0; color:#94a3b8; font-weight: 500;">Failed Attempts</td>
            <td style="padding:10px 0; font-weight: 600; color:#fca5a5; text-align: right;">{failed_count}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px 0; color:#94a3b8; font-weight: 500;">Hacker IP</td>
            <td style="padding:10px 0; font-family:monospace; color:#60a5fa; text-align: right;">{ip}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:#94a3b8; font-weight: 500;">Location</td>
            <td style="padding:10px 0; color:#e2e8f0; text-align: right;">{location}</td>
          </tr>
        </table>
      </div>

      {lock_section}

      <div style="margin-top: 24px; text-align: center;">
        <a href="{settings.FRONTEND_URL}/login" style="background:#ef4444; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; display:inline-block; font-size:0.9rem; transition: background 0.2s;">
          Secure Your Account 🛡️
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 30px 0 15px 0;" />
      <p style="color:#64748b; font-size:0.75rem; text-align: center; margin: 0;">
        This is an automated security alert from SentinelAI. If this was you, you can safely ignore this email.
      </p>
    </div>
    """
    return await send_email(to, f"🚨 Security Alert: Repeated Login Failures on {app_name}", html)

