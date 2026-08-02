export const getDeviceInfo = () => {
  const ua = navigator.userAgent;

  const getBrowser = () => {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown Browser';
  };

  const getOS = () => {
    if (ua.includes('Windows NT 10')) return 'Windows 10';
    if (ua.includes('Windows NT 6')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown OS';
  };

  const getDeviceType = () => {
    if (/Mobi|Android/i.test(ua)) return 'Mobile';
    if (/Tablet|iPad/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  return {
    browser: getBrowser(),
    os: getOS(),
    deviceType: getDeviceType(),
    userAgent: ua,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
