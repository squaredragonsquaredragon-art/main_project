"""
Rule-based + ML hybrid anomaly detector.
Uses Isolation Forest trained on login patterns.
Falls back to heuristic rules when no model exists.

Rules & Risk Scores:
  1. Brute force         : ≥3 failed attempts  → +50 (suspicious at ≥30)
  2. New IP address      : First-time IP        → +35 (suspicious on its own)
  3. New device/browser  : First-time device    → +25
  4. Unusual hour        : 1am – 5am            → +20
  5. Geo anomaly         : Different country    → +30
  6. Known bad IP range  : TOR / malicious      → +30
  7. ML model boost      : Isolation Forest     → +20
"""
import os
import joblib
import numpy as np
from datetime import datetime, timezone
from app.utils.logger import get_logger

logger = get_logger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

_model = None


def _load_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            logger.info("ML model loaded from disk.")
        except Exception as e:
            logger.warning(f"Could not load model: {e}")
    return _model


def _hour_of_day(dt: datetime) -> int:
    return dt.hour


def _is_unusual_hour(hour: int) -> bool:
    """Flag logins between 1am – 5am as unusual."""
    return 1 <= hour <= 5


def _ip_to_int(ip: str) -> int:
    try:
        parts = ip.split(".")
        if len(parts) == 4:
            return sum(int(p) << (8 * (3 - i)) for i, p in enumerate(parts))
    except Exception:
        pass
    return 0


def _normalize_browser(browser: str) -> str:
    """Normalize browser string to a consistent key for comparison."""
    if not browser:
        return "unknown"
    b = browser.lower().strip()
    for known in ["chrome", "firefox", "safari", "edge", "opera", "brave", "samsung"]:
        if known in b:
            return known
    return b.split("/")[0].split(" ")[0]  # first token


def _normalize_device(device: str) -> str:
    """Normalize device/OS string to a consistent key for comparison."""
    if not device:
        return "unknown"
    d = device.lower().strip()
    for known in ["windows", "mac", "linux", "android", "ios", "iphone", "ipad"]:
        if known in d:
            return known
    return d.split(" ")[0]


def analyze_login(
    ip_address: str,
    country: str,
    browser: str,
    device: str,
    login_hour: int,
    recent_ips: list[str],
    recent_failed_count: int = 0,
    user_country: str = "",
    recent_browsers: list[str] | None = None,
    recent_devices: list[str] | None = None,
    is_first_login: bool = False,
) -> dict:
    """
    Returns: {
      is_suspicious: bool,
      risk_score: float (0-100),
      alert_type: str | None,
      description: str,
      all_flags: list[str]
    }
    """
    risk = 0.0
    alerts = []

    # ── Rule 1: Brute force (≥3 recent failures) ─────────────────────────────
    # Threshold lowered to 3 so it triggers well before the 5-attempt lockout
    if recent_failed_count >= 3:
        risk += 50
        alerts.append("brute_force")
    elif recent_failed_count >= 1:
        # Even 1 failure adds a small risk signal
        risk += 10

    # ── Rule 2: New IP address ────────────────────────────────────────────────
    # Threshold raised to 35 so a single new-IP login IS suspicious on its own
    if is_first_login:
        # Very first login ever — new IP expected, don't double-penalise
        pass
    elif ip_address not in recent_ips and recent_ips:
        risk += 35
        alerts.append("new_ip")

    # ── Rule 3: New device / browser fingerprint ──────────────────────────────
    norm_browser = _normalize_browser(browser)
    norm_device = _normalize_device(device)

    recent_norm_browsers = [_normalize_browser(b) for b in (recent_browsers or [])]
    recent_norm_devices = [_normalize_device(d) for d in (recent_devices or [])]

    new_browser = (
        recent_norm_browsers  # only flag if we have prior history
        and norm_browser not in recent_norm_browsers
        and norm_browser not in ("unknown", "")
    )
    new_device = (
        recent_norm_devices
        and norm_device not in recent_norm_devices
        and norm_device not in ("unknown", "")
    )

    if new_browser and new_device:
        # Both browser AND device are new — stronger signal
        risk += 30
        alerts.append("new_device")
    elif new_browser:
        risk += 20
        alerts.append("new_device")
    elif new_device:
        risk += 15
        alerts.append("new_device")

    # ── Rule 4: Unusual hour (1am – 5am) ─────────────────────────────────────
    if _is_unusual_hour(login_hour):
        risk += 20
        alerts.append("unusual_time")

    # ── Rule 5: Geo anomaly (different country from usual) ────────────────────
    if user_country and country and country.lower() != user_country.lower():
        risk += 30
        alerts.append("geo_anomaly")

    # ── Rule 6: Known bad / TOR IP ranges ────────────────────────────────────
    BAD_PREFIXES = (
        "185.220.", "194.165.", "45.142.",   # TOR exit nodes
        "198.96.",  "171.25.",  "192.42.",   # known TOR / VPN ranges
    )
    if ip_address.startswith(BAD_PREFIXES):
        risk += 30
        alerts.append("suspicious_ip")

    # ── Rule 7: ML model boost (Isolation Forest) ─────────────────────────────
    # Model uses richer feature vector: ip_int, hour, failed_count, #ips,
    # unusual_hour_flag, new_ip_flag, new_device_flag, total_flags
    model = _load_model()
    if model is not None:
        try:
            features = np.array([[
                _ip_to_int(ip_address),
                login_hour,
                recent_failed_count,
                len(recent_ips),
                1 if _is_unusual_hour(login_hour) else 0,
                1 if (ip_address not in recent_ips and recent_ips) else 0,
                1 if (new_browser or new_device) else 0,
                len(alerts),  # total rule flags so far
            ]])
            pred = model.predict(features)
            if pred[0] == -1:  # Isolation Forest anomaly = -1
                risk += 20
                if "ml_anomaly" not in alerts:
                    alerts.append("ml_anomaly")
        except Exception as e:
            logger.debug(f"ML inference error: {e}")

    risk = min(risk, 100.0)

    # ── Suspicious: ANY anomaly flag (risk > 0) triggers suspicious ───────────
    # Previously threshold was 30. Now ANY rule trigger = suspicious so that
    # even low-risk signals (new device alone = 15, unusual hour = 20) are
    # captured in the security log and reviewed by the admin.
    is_suspicious = risk > 0

    # ── Severity tier based on risk score ─────────────────────────────────────
    if risk >= 70:
        severity = "critical"
    elif risk >= 45:
        severity = "high"
    elif risk >= 20:
        severity = "medium"
    else:
        severity = "low"

    primary_alert = alerts[0] if alerts else None

    descriptions = {
        "brute_force":   f"Multiple failed login attempts detected from IP {ip_address}",
        "new_ip":        f"First-time login from new IP address {ip_address}",
        "new_device":    f"Login from an unrecognised device or browser: {browser} on {device}",
        "geo_anomaly":   f"Login from unexpected country: {country}",
        "unusual_time":  f"Login at unusual hour ({login_hour}:00 UTC) — potential unauthorised access",
        "suspicious_ip": f"Login from known malicious / TOR exit-node IP: {ip_address}",
        "ml_anomaly":    "AI anomaly detection flagged this login pattern as suspicious",
    }

    description = descriptions.get(primary_alert, "Unusual login activity detected")

    return {
        "is_suspicious": is_suspicious,
        "risk_score": round(risk, 2),
        "severity": severity,
        "alert_type": primary_alert,
        "description": description,
        "all_flags": alerts,
    }
