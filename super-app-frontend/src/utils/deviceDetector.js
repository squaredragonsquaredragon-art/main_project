export const getDeviceFingerprint = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Extract Browser Name
  if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Browser';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
  else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';
  else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Edge';
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';

  // Extract OS
  if (ua.indexOf('Windows NT 10.0') > -1) os = 'Windows 10/11';
  else if (ua.indexOf('Windows NT 6.2') > -1) os = 'Windows 8';
  else if (ua.indexOf('Windows NT 6.1') > -1) os = 'Windows 7';
  else if (ua.indexOf('Macintosh') > -1) os = 'MacOS';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';

  return {
    userAgent: ua,
    browser,
    os,
    resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
  };
};
