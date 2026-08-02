// Browser security client metrics parser
import { getDeviceFingerprint } from './deviceDetector';

export const calculateTrustIndex = () => {
  const metrics = getDeviceFingerprint();
  let score = 100;

  // Deduct points for generic red flags
  if (!navigator.cookieEnabled) score -= 20;
  if (navigator.webdriver) score -= 40; // Automated bots flag
  if (metrics.isMobile && window.screen.width > 768) score -= 10; // Mobile UA mismatch

  return {
    score: Math.max(0, score),
    grade: score >= 90 ? 'A (Secure)' : score >= 75 ? 'B (Standard)' : 'F (Suspicious)',
    webdriver: navigator.webdriver || false,
    cookiesEnabled: navigator.cookieEnabled,
  };
};

export const generateBiometricFingerprint = async () => {
  const fingerprint = getDeviceFingerprint();
  const rawString = `${fingerprint.userAgent}|${fingerprint.resolution}|${fingerprint.language}|${fingerprint.timeZone}`;
  
  // Create a quick numeric hash for storage
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};
