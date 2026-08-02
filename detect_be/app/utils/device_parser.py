from user_agents import parse


def parse_user_agent(ua_string: str) -> dict:
    """Parse a User-Agent string and return structured device info."""
    if not ua_string:
        return {"browser": "Unknown", "os": "Unknown", "device": "Desktop"}

    ua = parse(ua_string)

    browser = ua.browser.family or "Unknown"
    browser_version = ua.browser.version_string
    if browser_version:
        browser = f"{browser} {browser_version}"

    os = ua.os.family or "Unknown"
    os_version = ua.os.version_string
    if os_version:
        os = f"{os} {os_version}"

    if ua.is_mobile:
        device = "Mobile"
    elif ua.is_tablet:
        device = "Tablet"
    else:
        device = "Desktop"

    return {"browser": browser, "os": os, "device": device}
