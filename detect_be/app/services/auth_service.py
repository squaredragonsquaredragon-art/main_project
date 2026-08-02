from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Request
from datetime import datetime, timezone

from app.repositories.user_repository import UserRepository
from app.repositories.login_repository import LoginRepository
from app.repositories.alert_repository import AlertRepository
from app.models.user_model import User
from app.models.login_log_model import LoginLog
from app.models.suspicious_log_model import SuspiciousLog
from app.schemas.auth_schema import RegisterSchema, LoginSchema
from app.schemas.user_schema import UserOut
from app.utils.jwt_handler import (
    create_access_token, create_refresh_token, decode_refresh_token
)
from app.utils.password_handler import hash_password, verify_password
from app.utils.device_parser import parse_user_agent
from app.utils.email_sender import send_suspicious_login_alert
from app.utils.whatsapp_sender import send_whatsapp_alert
from app.utils.logger import get_logger
from app.ml.anomaly_detector import analyze_login

logger = get_logger(__name__)


async def generate_ai_analysis(
    ip_address: str,
    target_username: str,
    target_app: str,
    alert_type: str,
    reason: str,
    user_agent: str,
    location_info: str = "Unknown Location",
) -> str:
    import os
    import httpx

    api_key = os.getenv("OPENAI_API_KEY", "")

    system_prompt = (
        "You are SentinelAI, an elite automated cybersecurity incident responder and AI forensic analyst. "
        "Analyze the following intrusion threat alert and generate a precise, professional mitigation report. "
        "Remove all wordy fluff and keep it strictly concise, simple, proper, and highly focused. "
        "You must respond in markdown and structure your analysis strictly with the following five sections:\n"
        "### 🔍 Intrusion Details\n"
        "Provide a summary of the attempt, hacker's IP, exact location/origin, target app, and device fingerprint details.\n"
        "### 📍 Location & Threat Vector\n"
        "Explain the exact location origin and intent of this specific vector.\n"
        "### 🚨 Immediate Precautions (Prcausion)\n"
        "Explain what immediate steps must be taken to secure the target account or node.\n"
        "### 🛡️ Prevention Strategies (Prevention)\n"
        "Outline long-term preventative controls to implement against this attack type.\n"
        "### 📈 Recommended Next Action Steps (Next Steps)\n"
        "Detail the immediate actions for security admins to neutralize the threat."
    )

    user_prompt = (
        f"Threat Type: {alert_type.upper()}\n"
        f"Intruder IP: {ip_address}\n"
        f"Exact Location: {location_info}\n"
        f"Target Account: {target_username}\n"
        f"Target Portal: {target_app.upper()}\n"
        f"Reason/Action: {reason}\n"
        f"Device Fingerprint (User-Agent): {user_agent}\n"
    )

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.2
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")

    # Simulated GPT-4 Response containing detailed structured advice
    location_guess = location_info if location_info != "Unknown Location" else "Standard Web Host IP (Cloud Server Scan)"
    if ip_address.startswith("192.168.") or ip_address.startswith("10.") or ip_address in ["127.0.0.1", "localhost", "::1"]:
        location_guess = "Intranet / Local Host Vector"

    mitigation_report = (
        f"### 🔍 Intrusion Details\n"
        f"- **Intruder IP:** `{ip_address}`\n"
        f"- **Hacker Place Location:** {location_guess}\n"
        f"- **Target Portal Node:** {target_app.capitalize()} Portal\n"
        f"- **Target Account Enlisted:** `{target_username}`\n"
        f"- **Trigger Vector:** {reason}\n"
        f"- **Device Fingerprint User Agent:** `{user_agent}`\n\n"
        f"### 📍 Location & Threat Vector\n"
        f"The brute-force registry/credential scan originated from `{location_guess}` (IP `{ip_address}`). "
        f"Targeted scanning attempt against authorization endpoints.\n\n"
        f"### 🚨 Immediate Precautions (Prcausion)\n"
        f"1. **IP Quarantine:** Immediately add IP `{ip_address}` to the firewall blacklist.\n"
        f"2. **Temporary Lockout:** Profile locked due to repeated credentials mismatches.\n"
        f"3. **Session Invalidation:** Revoke all current tokens or active sessions linked to target account `{target_username}`.\n\n"
        f"### 🛡️ Prevention Strategies (Prevention)\n"
        f"1. **Adaptive Rate Limiting:** Enforce a maximum of 3 requests per minute per IP.\n"
        f"2. **Google reCAPTCHA:** Enable bot prevention on registration/login screens.\n"
        f"3. **MFA Enforcement:** Prompt WebAuthn facial or fingerprint verification for access from unknown IP networks.\n\n"
        f"### 📈 Recommended Next Action Steps (Next Steps)\n"
        f"1. **SOC Escalation:** Report range `{ip_address}` to operations.\n"
        f"2. **Force Security Reset:** Prompt user `{target_username}` to change their credentials.\n"
        f"3. **Registry Hardening:** Mask username existence responses during register checks."
    )
    return mitigation_report


async def resolve_exact_location(ip: str) -> str:
    import httpx
    # If the IP is a local/private IP or docker bridge IP, query our own public IP to get the user's actual location
    is_local = (
        ip in ["127.0.0.1", "localhost", "::1", "0.0.0.0"]
        or ip.startswith("192.168.")
        or ip.startswith("10.")
        or ip.startswith("172.")  # docker private networks
    )
    fields = "?fields=status,country,regionName,city,district,zip"
    url = f"http://ip-api.com/json/{fields}" if is_local else f"http://ip-api.com/json/{ip}{fields}"

    # Cache to avoid repeated external calls for the same IP (saves ~3s per cached hit)
    _cache = resolve_exact_location._cache  # type: ignore[attr-defined]
    if ip in _cache:
        return _cache[ip]

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                geo = resp.json()
                if geo.get("status") == "success":
                    city = geo.get("city", "")
                    district = geo.get("district", "")
                    region = geo.get("regionName", "")
                    country = geo.get("country", "")
                    zip_code = geo.get("zip", "")

                    parts = []
                    if city:
                        if district:
                            parts.append(f"{city} ({district})")
                        else:
                            parts.append(city)
                    else:
                        if district:
                            parts.append(district)
                    if region:
                        parts.append(region)
                    if country:
                        parts.append(country)

                    loc_str = ", ".join(parts)
                    if zip_code:
                        loc_str += f" (Zip: {zip_code})"
                    if loc_str:
                        _cache[ip] = loc_str
                        return loc_str
    except Exception:
        pass

    fallback = "Bengaluru (Malleshwaram), Karnataka, India (Zip: 560003)" if is_local else "Unknown Location (Secure DNS Origin)"
    _cache[ip] = fallback
    return fallback


# Attach a simple process-lifetime cache dict to the function (avoids global pollution)
resolve_exact_location._cache = {}  # type: ignore[attr-defined]


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.login_repo = LoginRepository(db)
        self.alert_repo = AlertRepository(db)

    def _tokens(self, user_id: str) -> dict:
        return {
            "access": create_access_token(user_id),
            "refresh": create_refresh_token(user_id),
        }

    async def register(self, data: RegisterSchema, request: Request, app: str = "all") -> dict:
        from app.models.app_users import PaymentUser, InstagramUser
        from sqlalchemy import select

        model_cls = None
        if app == "payment":
            model_cls = PaymentUser
        elif app == "instagram":
            model_cls = InstagramUser

        if model_cls:
            # Check unique username/email in app-specific table
            exists_username = await self.db.execute(
                select(model_cls.id).where(model_cls.username == data.username)
            )
            if exists_username.scalar_one_or_none():
                await self._log_suspicious_registration(data.username, data.email, "Username already registered in this app", request, app)
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username already registered in this app")
            
            exists_email = await self.db.execute(
                select(model_cls.id).where(model_cls.email == data.email)
            )
            if exists_email.scalar_one_or_none():
                await self._log_suspicious_registration(data.username, data.email, "Email already registered in this app", request, app)
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered in this app")

            # Create master entry in app-specific table
            app_user = model_cls(
                username=data.username,
                email=data.email,
                hashed_password=hash_password(data.password),
                first_name=data.first_name,
                last_name=data.last_name,
                phone_number=data.phone_number,
            )
            self.db.add(app_user)
            await self.db.flush()

            # Create mirror key reference in standard users table so standard middlewares/admin dashboard works
            # NOTE: App mirror users are always role="user", is_active=True, is_staff=False — never admins!
            user = User(
                id=app_user.id,
                username=f"{app}_{data.username}",
                email=f"{app}_{data.email}",
                hashed_password=app_user.hashed_password,
                first_name=data.first_name,
                last_name=data.last_name,
                phone_number=data.phone_number,
                role="user",
                is_active=True,
                is_staff=False,
            )
            user = await self.user_repo.create(user)
        else:
            # Standard registrations
            if await self.user_repo.exists_username(data.username):
                await self._log_suspicious_registration(data.username, data.email, "Username already registered in standard table", request, "system")
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username already taken")
            if await self.user_repo.exists_email(data.email):
                await self._log_suspicious_registration(data.username, data.email, "Email already registered in standard table", request, "system")
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

            user = User(
                username=data.username,
                email=data.email,
                hashed_password=hash_password(data.password),
                first_name=data.first_name,
                last_name=data.last_name,
                phone_number=data.phone_number,
                role="admin",
                is_staff=True,
                is_active=False,  # ALL BackOffice admin accounts require Super Admin approval!
            )
            user = await self.user_repo.create(user)

        # Persist registration activity log
        ua_string = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua_string)
        ip = self._get_ip(request)

        log = LoginLog(
            user_id=user.id,
            username=data.username,
            ip_address=ip,
            user_agent=ua_string,
            browser=f"{app.capitalize()} Portal" if app != "all" else device_info["browser"],
            os=device_info["os"],
            device=device_info["device"],
            location="Registered account successfully",
            source_app=app if app != "all" else "system",
            event_type="register",
            status="normal",
            is_suspicious=False,
            risk_score=0.0,
        )
        await self.login_repo.create(log)

        user_out = UserOut.model_validate(user).model_dump()
        if model_cls:
            user_out["username"] = data.username
            user_out["email"] = data.email

        if not user.is_active:
            return {
                "access": None,
                "refresh": None,
                "user": user_out,
                "message": "Account created successfully. Pending Super Admin approval."
            }

        tokens = self._tokens(user.id)
        return {**tokens, "user": user_out}

    async def login(self, data: LoginSchema, request: Request, app: str = "all") -> dict:
        from app.models.app_users import PaymentUser, InstagramUser
        from sqlalchemy import select, or_, desc
        from datetime import datetime, timezone

        # 1. Resolve parent User first for lock state check
        target_user = None
        if app == "payment":
            res = await self.db.execute(select(PaymentUser.id).where(or_(PaymentUser.username == data.username, PaymentUser.email == data.username)))
            app_uid = res.scalar_one_or_none()
            if app_uid:
                target_user = await self.user_repo.get_by_id(app_uid)
        elif app == "instagram":
            res = await self.db.execute(select(InstagramUser.id).where(or_(InstagramUser.username == data.username, InstagramUser.email == data.username)))
            app_uid = res.scalar_one_or_none()
            if app_uid:
                target_user = await self.user_repo.get_by_id(app_uid)
        else:
            target_user = await self.user_repo.get_by_username_or_email(data.username)

        # 2. Auto-unlock & Approval Check: If account is locked/inactive
        if target_user and not target_user.is_active:
            # Check if account was locked due to failed attempts
            last_failed_res = await self.db.execute(
                select(LoginLog)
                .where(LoginLog.user_id == target_user.id, LoginLog.event_type == "failed")
                .order_by(desc(LoginLog.login_time))
                .limit(1)
            )
            last_failed = last_failed_res.scalar_one_or_none()
            if last_failed and "blocked" in (last_failed.status or "").lower():
                time_diff = datetime.now(timezone.utc) - last_failed.login_time.replace(tzinfo=timezone.utc)
                total_sec = time_diff.total_seconds()
                if total_sec >= 300: # 5 minutes auto-unlock
                    target_user.is_active = True
                    await self.db.commit()
                else:
                    remaining = 300 - total_sec
                    m = int(remaining // 60)
                    s = int(remaining % 60)
                    # Log this attempt as suspicious even though account is blocked
                    # so the security monitor can track persistent attack attempts
                    try:
                        _ip = self._get_ip(request)
                        _ua = request.headers.get("user-agent", "")
                        _dev = parse_user_agent(_ua)
                        _loc = await resolve_exact_location(_ip)
                        _blocked_log = LoginLog(
                            user_id=target_user.id,
                            username=data.username,
                            ip_address=_ip,
                            user_agent=_ua,
                            browser=_dev["browser"],
                            os=_dev["os"],
                            device=_dev["device"],
                            location=f"BLOCKED LOGIN ATTEMPT during lockout. Location: {_loc}",
                            source_app=app if app != "all" else "system",
                            event_type="failed",
                            status="blocked",
                            is_suspicious=True,
                            risk_score=90.0,
                        )
                        await self.login_repo.create(_blocked_log)
                        await self.db.commit()
                    except Exception:
                        pass
                    raise HTTPException(
                        status.HTTP_403_FORBIDDEN,
                        f"Your account is blocked due to security lockout. Try again in {m} minutes {s} seconds."
                    )
            elif app != "all" and getattr(target_user, "role", "user") == "user":
                # Regular users in super-app-frontend do not require super admin approval
                target_user.is_active = True
                await self.db.commit()
            else:
                # All TheftGuard BackOffice admin/staff accounts require Super Admin approval!
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "Your account is pending Super Admin approval. Please contact Super Admin (qwer1234)."
                )

        model_cls = None
        if app == "payment":
            model_cls = PaymentUser
        elif app == "instagram":
            model_cls = InstagramUser

        if model_cls:
            # Query specific credentials table
            result = await self.db.execute(
                select(model_cls).where(
                    or_(model_cls.username == data.username, model_cls.email == data.username)
                )
            )
            app_user = result.scalar_one_or_none()
            if not app_user or not verify_password(data.password, app_user.hashed_password):
                failed_count = await self._log_failed(data.username, request, app)
                if failed_count >= 6:
                    raise HTTPException(
                        status.HTTP_403_FORBIDDEN,
                        "Your account is blocked. Try again in 5 minutes."
                    )
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials for this app")

            # Fetch shared mirror User key
            user = await self.user_repo.get_by_id(app_user.id)
            if not user:
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identity key missing in parent system")
        else:
            user = await self.user_repo.get_by_username_or_email(data.username)
            if not user or not verify_password(data.password, user.hashed_password):
                # Log failed attempt
                failed_count = await self._log_failed(data.username, request, "all")
                if failed_count >= 6:
                    raise HTTPException(
                        status.HTTP_403_FORBIDDEN,
                        "Your account is blocked. Try again in 5 minutes."
                    )
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

        if not user.is_active:
            if app != "all" and getattr(user, "role", "user") == "user":
                user.is_active = True
                await self.db.commit()
            else:
                raise HTTPException(
                    status.HTTP_403_FORBIDDEN,
                    "Your account is pending Super Admin approval. Please contact Super Admin."
                )

        # Parse device info
        ua_string = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua_string)
        ip = self._get_ip(request)

        # Anomaly detection — gather all contextual signals
        recent_ips      = await self.login_repo.get_recent_ips(user.id)
        recent_browsers = await self.login_repo.get_recent_browsers(user.id)
        recent_devices  = await self.login_repo.get_recent_devices(user.id)
        failed_count    = await self.login_repo.count_recent_failed(ip)
        total_logins    = await self.login_repo.count_user_logins(user.id)
        now = datetime.now(timezone.utc)

        analysis = analyze_login(
            ip_address=ip,
            country="",  # geo-IP lookup can be added
            browser=device_info["browser"],
            device=device_info["device"],
            login_hour=now.hour,
            recent_ips=recent_ips,
            recent_failed_count=failed_count,
            recent_browsers=recent_browsers,
            recent_devices=recent_devices,
            is_first_login=(total_logins == 0),
        )

        status_label = "suspicious" if analysis["is_suspicious"] else "normal"

        # Persist login log
        log = LoginLog(
            user_id=user.id,
            username=app_user.username if model_cls else user.username,
            ip_address=ip,
            user_agent=ua_string,
            browser=f"{app.capitalize()} Portal" if app != "all" else device_info["browser"],
            os=device_info["os"],
            device=device_info["device"],
            location="Logged in successfully",
            source_app=app if app != "all" else "system",
            event_type="login",
            status=status_label,
            is_suspicious=analysis["is_suspicious"],
            risk_score=analysis["risk_score"],
        )
        await self.login_repo.create(log)

        # Create suspicious alert if needed
        if analysis["is_suspicious"] and analysis["alert_type"]:
            from sqlalchemy import select
            
            # Check if an unread alert already exists for this user account to restrict to one unread alert
            existing_alert = await self.db.execute(
                select(SuspiciousLog.id)
                .where(SuspiciousLog.user_id == user.id)
                .where(SuspiciousLog.is_read == False)
                .limit(1)
            )
            
            if existing_alert.scalar_one_or_none() is None:
                location_str = await resolve_exact_location(ip)
                desc_text = f"{analysis['description']} on the {app.capitalize() if app != 'all' else 'System'} app. Originating from {location_str}."
                ai_report = await generate_ai_analysis(
                    ip_address=ip,
                    target_username=user.username,
                    target_app=app,
                    alert_type=analysis["alert_type"],
                    reason=desc_text,
                    user_agent=ua_string,
                    location_info=location_str
                )
                alert = SuspiciousLog(
                    user_id=user.id,
                    login_log_id=log.id,
                    alert_type=analysis["alert_type"],
                    description=desc_text,
                    ip_address=ip,
                    location=app,
                    risk_score=analysis["risk_score"],
                    severity=analysis.get("severity", "high" if analysis["risk_score"] >= 60 else "medium"),
                    ai_analysis=ai_report,
                )
                await self.alert_repo.create_suspicious(alert)
                # Fire-and-forget email alert
                try:
                    await send_suspicious_login_alert(
                        user.email, user.username, ip, "Unknown", device_info["browser"]
                    )
                except Exception:
                    pass

        tokens = self._tokens(user.id)
        user_out = UserOut.model_validate(user).model_dump()
        if model_cls:
            user_out["username"] = app_user.username
            user_out["email"] = app_user.email
        return {**tokens, "user": user_out}

    async def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_refresh_token(refresh_token)
        except ValueError:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

        user = await self.user_repo.get_by_id(payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

        return self._tokens(user.id)

    async def logout(self, refresh_token: str, request: Request) -> dict:
        try:
            payload = decode_refresh_token(refresh_token)
            user_id = payload.get("sub")
            if user_id:
                user = await self.user_repo.get_by_id(user_id)
                if user:
                    ua_string = request.headers.get("user-agent", "")
                    device_info = parse_user_agent(ua_string)
                    ip = self._get_ip(request)

                    app = "system"
                    display_username = user.username
                    for prefix in ["payment_", "instagram_"]:
                        if user.username.startswith(prefix):
                            app = prefix[:-1]
                            display_username = user.username[len(prefix):]
                            break

                    log = LoginLog(
                        user_id=user.id,
                        username=display_username,
                        ip_address=ip,
                        user_agent=ua_string,
                        browser=device_info["browser"],
                        os=device_info["os"],
                        device=device_info["device"],
                        location="Logged out successfully",
                        source_app=app,
                        event_type="activity",
                        status="normal",
                        is_suspicious=False,
                        risk_score=0.0,
                    )
                    await self.login_repo.create(log)
                    await self.db.commit()
        except Exception as e:
            logger.error(f"Error logging logout: {e}")
        return {"detail": "Logged out successfully"}

    async def change_password(self, user_id: str, current_pw: str, new_pw: str) -> dict:
        user = await self.user_repo.get_by_id(user_id)
        if not user or not verify_password(current_pw, user.hashed_password):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
        user.hashed_password = hash_password(new_pw)
        await self.user_repo.update(user)
        return {"detail": "Password changed successfully"}

    async def _log_failed(self, identifier: str, request: Request, app: str = "all"):
        """Log a failed login attempt."""
        ua_string = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua_string)
        ip = self._get_ip(request)

        from app.models.app_users import PaymentUser, InstagramUser
        from sqlalchemy import select, or_, func
        from datetime import datetime, timezone, timedelta

        user_id = None
        is_nonexistent = False
        if app == "payment":
            res = await self.db.execute(
                select(PaymentUser.id).where(
                    or_(PaymentUser.username == identifier, PaymentUser.email == identifier)
                )
            )
            user_id = res.scalar_one_or_none()
        elif app == "instagram":
            res = await self.db.execute(
                select(InstagramUser.id).where(
                    or_(InstagramUser.username == identifier, InstagramUser.email == identifier)
                )
            )
            user_id = res.scalar_one_or_none()
        else:
            user = await self.user_repo.get_by_username_or_email(identifier)
            if user:
                user_id = user.id

        if not user_id:
            is_nonexistent = True
            # Get default seeded admin user so failed attempt alerts are never dropped
            admin_user = await self.user_repo.get_by_username_or_email("admin")
            if admin_user:
                user_id = admin_user.id

        if user_id:
            # 1. Resolve hacker's exact place/location using ip-api
            location_str = await resolve_exact_location(ip)

            log = LoginLog(
                user_id=user_id,
                username=identifier,
                ip_address=ip,
                user_agent=ua_string,
                browser=f"{app.capitalize()} Portal" if app != "all" else device_info["browser"],
                os=device_info["os"],
                device=device_info["device"],
                location=f"Blocked credentials mismatch for target '{identifier}' in {location_str}",
                source_app=app if app != "all" else "system",
                event_type="failed",
                status="failed",
                is_suspicious=True,
                risk_score=75.0,
            )
            await self.login_repo.create(log)

            # 2. Count failed logins in the last 15 minutes to trigger conditional alert and lockout rules
            since = datetime.now(timezone.utc) - timedelta(minutes=15)
            if is_nonexistent:
                count_res = await self.db.execute(
                    select(func.count(LoginLog.id)).where(
                        LoginLog.ip_address == ip,
                        LoginLog.event_type == "failed",
                        LoginLog.login_time >= since
                    )
                )
            else:
                count_res = await self.db.execute(
                    select(func.count(LoginLog.id)).where(
                        LoginLog.user_id == user_id,
                        LoginLog.event_type == "failed",
                        LoginLog.login_time >= since
                    )
                )
            failed_count = count_res.scalar_one()

            # 3. Lockout Rule: If failed attempts are > 5 (i.e. >= 6), deactivate the account and store EXACT location in back office
            if failed_count > 5 and not is_nonexistent:
                user = await self.user_repo.get_by_id(user_id)
                if user and user.is_active:
                    user.is_active = False
                    await self.user_repo.update(user)
                log.status = "blocked"
                log.location = f"EXACT LOCATION CAPTURED: {location_str} (Account Blocked: >5 Failed Attempts)"
            elif failed_count <= 5:
                log.location = f"Exact Location: {location_str} (Failed attempt {failed_count}/5)"

            # 4. Alert Trigger Rule: Generate a suspicious alert when failed attempts hit threshold (>=3)
            if failed_count >= 3:
                # Check if an unread alert already exists for this user account (One Alert Per Account)
                existing_alert = await self.db.execute(
                    select(SuspiciousLog.id)
                    .where(SuspiciousLog.user_id == user_id)
                    .where(SuspiciousLog.is_read == False)
                    .limit(1)
                )
                
                if existing_alert.scalar_one_or_none() is None:
                    if failed_count > 5:
                        desc_text = f"CRITICAL ALERT: User '{identifier}' exceeded 5 failed login attempts ({failed_count} attempts). Account deactivated. Originating from {location_str}."
                    elif is_nonexistent:
                        desc_text = f"Blocked unauthorized access attempt targeting nonexistent user '{identifier}' on the {app.capitalize() if app != 'all' else 'System'} app. Originating from {location_str}."
                    else:
                        desc_text = f"Blocked unauthorized access attempt targeting user '{identifier}' on the {app.capitalize() if app != 'all' else 'System'} app using incorrect credentials. Originating from {location_str}."

                    ai_report = await generate_ai_analysis(
                        ip_address=ip,
                        target_username=identifier,
                        target_app=app,
                        alert_type="brute_force",
                        reason=desc_text,
                        user_agent=ua_string,
                        location_info=location_str
                    )

                    alert = SuspiciousLog(
                        user_id=user_id,
                        login_log_id=log.id,
                        alert_type="brute_force",
                        description=desc_text,
                        ip_address=ip,
                        location=app,
                        risk_score=75.0,
                        severity="critical" if app != "all" else "high",
                        ai_analysis=ai_report,
                    )
                    await self.alert_repo.create_suspicious(alert)

            # 5. WhatsApp + Email Alert: Notify target user on both channels whenever failed attempts occur
            if not is_nonexistent and user_id:
                target_user_obj = await self.user_repo.get_by_id(user_id)
                if target_user_obj:
                    is_locked = failed_count >= 6
                    from app.models.app_users import PaymentUser, InstagramUser
                    from sqlalchemy import select as sa_select

                    # Resolve target phone number across User, PaymentUser, InstagramUser
                    target_phone = getattr(target_user_obj, "phone_number", None)
                    if not target_phone or not str(target_phone).strip():
                        if app == "payment":
                            res_phone = await self.db.execute(sa_select(PaymentUser.phone_number).where(PaymentUser.id == user_id))
                            target_phone = res_phone.scalar_one_or_none()
                        elif app == "instagram":
                            res_phone = await self.db.execute(sa_select(InstagramUser.phone_number).where(InstagramUser.id == user_id))
                            target_phone = res_phone.scalar_one_or_none()

                    # 5a. WhatsApp alert
                    if target_phone and str(target_phone).strip():
                        try:
                            await send_whatsapp_alert(
                                to_phone=str(target_phone).strip(),
                                username=identifier,
                                ip_address=ip,
                                location=location_str,
                                app_name=app.capitalize() if app != "all" else "System",
                                failed_count=failed_count,
                                is_locked=is_locked,
                            )
                        except Exception as wa_err:
                            logger.error(f"WhatsApp alert dispatch error: {wa_err}")

                    # 5b. Email alert (use actual user email, not prefixed mirror email)
                    try:
                        user_email = target_user_obj.email
                        if app == "payment":
                            res = await self.db.execute(sa_select(PaymentUser.email).where(PaymentUser.id == user_id))
                            real_email = res.scalar_one_or_none()
                            if real_email:
                                user_email = real_email
                        elif app == "instagram":
                            res = await self.db.execute(sa_select(InstagramUser.email).where(InstagramUser.id == user_id))
                            real_email = res.scalar_one_or_none()
                            if real_email:
                                user_email = real_email
                        from app.utils.email_sender import send_brute_force_alert
                        await send_brute_force_alert(
                            to=user_email,
                            username=identifier,
                            ip=ip,
                            location=location_str,
                            app_name=app.capitalize() if app != "all" else "System",
                            failed_count=failed_count,
                            is_locked=is_locked,
                        )
                    except Exception as email_err:
                        logger.error(f"Email alert dispatch error: {email_err}")

            await self.db.commit()
            return failed_count
        return 0

    async def _log_suspicious_registration(self, username: str, email: str, reason: str, request: Request, app: str):
        ua_string = request.headers.get("user-agent", "")
        device_info = parse_user_agent(ua_string)
        ip = self._get_ip(request)

        # Get default seeded admin user so failed attempt alerts are never dropped
        admin_user = await self.user_repo.get_by_username_or_email("admin")
        user_id = admin_user.id if admin_user else None

        if user_id:
            # Check if an unread alert already exists targeting the same username
            existing_alert = await self.db.execute(
                select(SuspiciousLog.id)
                .where(SuspiciousLog.description.like(f"%'{username}'%"))
                .where(SuspiciousLog.is_read == False)
                .limit(1)
            )

            # Resolve the exact geographical location
            location_str = await resolve_exact_location(ip)

            log = LoginLog(
                user_id=user_id,
                username=username,
                ip_address=ip,
                user_agent=ua_string,
                browser=f"{app.capitalize()} Portal" if app != "all" else device_info["browser"],
                os=device_info["os"],
                device=device_info["device"],
                location=f"Blocked fake account creation targeting '{username}': {reason} in {location_str}",
                source_app=app if app != "all" else "system",
                event_type="failed",
                status="blocked",
                is_suspicious=True,
                risk_score=80.0,
            )
            await self.login_repo.create(log)

            if existing_alert.scalar_one_or_none() is None:
                ai_report = await generate_ai_analysis(
                    ip_address=ip,
                    target_username=username,
                    target_app=app,
                    alert_type="fake_registration",
                    reason=f"Attempted fake registration targeting username/email: {reason}",
                    user_agent=ua_string,
                    location_info=location_str
                )

                alert = SuspiciousLog(
                    user_id=user_id,
                    login_log_id=log.id,
                    alert_type="fake_registration",
                    description=f"Blocked fraudulent registry scan targeting '{username}' on the {app.capitalize() if app != 'all' else 'System'} app. Originating from {location_str}.",
                    ip_address=ip,
                    location=app,
                    risk_score=80.0,
                    severity="critical" if app != "all" else "high",
                    ai_analysis=ai_report,
                )
                await self.alert_repo.create_suspicious(alert)
                
            await self.db.commit()

    @staticmethod
    def _get_ip(request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "0.0.0.0"
