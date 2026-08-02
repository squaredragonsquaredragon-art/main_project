import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDeviceFingerprint } from '../utils/deviceDetector';
import { calculateTrustIndex, generateBiometricFingerprint } from '../utils/securityHelper';

const SecurityContext = createContext(null);

export const SecurityProvider = ({ children }) => {
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [trustIndex, setTrustIndex] = useState(null);
  const [biometricKey, setBiometricKey] = useState('');

  useEffect(() => {
    // Defer security initialization — not needed for first paint
    // Cache in sessionStorage so re-mounts within the same tab reuse the result instantly
    const cached = sessionStorage.getItem('_sentinel_security_init');
    if (cached) {
      try {
        const { fingerprint, trust, key } = JSON.parse(cached);
        setDeviceFingerprint(fingerprint);
        setTrustIndex(trust);
        setBiometricKey(key);
        return;
      } catch (_) { /* ignore bad cache */ }
    }

    const timer = setTimeout(async () => {
      const fingerprint = getDeviceFingerprint();
      const trust = calculateTrustIndex();
      const key = await generateBiometricFingerprint();

      setDeviceFingerprint(fingerprint);
      setTrustIndex(trust);
      setBiometricKey(key);

      try {
        sessionStorage.setItem('_sentinel_security_init', JSON.stringify({ fingerprint, trust, key }));
      } catch (_) { /* storage quota exceeded — ignore */ }
    }, 500); // 500ms defer — well after first paint

    return () => clearTimeout(timer);
  }, []);

  return (
    <SecurityContext.Provider value={{ deviceFingerprint, trustIndex, biometricKey }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);

