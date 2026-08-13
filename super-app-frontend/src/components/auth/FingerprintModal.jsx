import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, X, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { registerPasskey, authenticateWithPasskey } from '../../services/biometricService';

/**
 * FingerprintModal Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal for registering or verifying user Fingerprint via Dell Precision laptop sensor / Windows Hello.
 *
 * Props:
 *   mode: 'register' | 'verify'
 *   username: string
 *   onSuccess: (resultData) => void
 *   onClose: () => void
 */
const FingerprintModal = ({ mode = 'register', username, onSuccess, onClose }) => {
  const [status, setStatus] = useState('Touch the Dell Fingerprint reader on your laptop');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [successDone, setSuccessDone] = useState(false);

  const startFingerprintScan = async () => {
    setScanError('');
    setScanning(true);
    setStatus('Waiting for Fingerprint sensor touch...');

    try {
      if (mode === 'register') {
        const res = await registerPasskey(username, 'Dell Fingerprint Reader');
        if (!res.success) {
          throw new Error(res.error || 'Fingerprint registration failed.');
        }
        setSuccessDone(true);
        setStatus('Fingerprint registered successfully!');
        setTimeout(() => onSuccess?.(res), 1200);
      } else {
        const res = await authenticateWithPasskey(username);
        if (!res.success) {
          throw new Error(res.error || 'Fingerprint verification failed.');
        }
        setSuccessDone(true);
        setStatus(`Fingerprint verified! Welcome back, ${res.user.username}!`);
        setTimeout(() => onSuccess?.(res), 1200);
      }
    } catch (err) {
      console.error('Fingerprint auth error:', err);
      setScanError(err.message || 'Fingerprint sensor scan failed.');
      setStatus('Fingerprint scan failed. Click retry below.');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    // Automatically trigger scanner prompt on mount
    startFingerprintScan();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(8,12,24,0.99))',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(167,139,250,0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
        >
          <X size={16} />
        </button>

        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(56,189,248,0.2))',
              border: '1px solid rgba(167,139,250,0.35)',
              marginBottom: '10px',
              boxShadow: '0 0 25px rgba(167,139,250,0.3)',
              color: '#a78bfa',
            }}
          >
            <Fingerprint size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#f8fafc' }}>
            {mode === 'register' ? 'Register Fingerprint' : 'Fingerprint Scan Login'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            User: <strong style={{ color: '#a78bfa' }}>{username}</strong>
          </p>
        </div>

        {/* Animated Scanner HUD Container */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.6)',
            border: scanning
              ? '2px solid #a78bfa'
              : successDone
              ? '2px solid #4ade80'
              : '2px dashed rgba(167,139,250,0.4)',
            boxShadow: scanning
              ? '0 0 35px rgba(167,139,250,0.4), inset 0 0 20px rgba(167,139,250,0.2)'
              : successDone
              ? '0 0 35px rgba(74,222,128,0.4)'
              : '0 0 15px rgba(167,139,250,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {successDone ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#4ade80',
                animation: 'scaleUp 0.3s ease',
              }}
            >
              <CheckCircle2 size={54} />
            </div>
          ) : (
            <>
              <Fingerprint
                size={74}
                style={{
                  color: scanning ? '#a78bfa' : '#64748b',
                  opacity: scanning ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  animation: scanning ? 'fingerprintPulse 1.2s ease-in-out infinite' : 'none',
                }}
              />

              {/* Glowing Sensor Ring */}
              {scanning && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: '#a78bfa',
                    borderBottomColor: '#38bdf8',
                    animation: 'spin 1.5s linear infinite',
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Status Text / Error Box */}
        <div style={{ marginTop: '20px', textAlign: 'center', width: '100%' }}>
          {scanError ? (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              ⚠️ {scanError}
            </div>
          ) : (
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: scanning ? '#a78bfa' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {scanning && <RefreshCw size={14} className="spin" />}
              {status}
            </div>
          )}
        </div>

        {/* Retry Button if error */}
        {!successDone && (
          <button
            onClick={startFingerprintScan}
            disabled={scanning}
            style={{
              marginTop: '18px',
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              background: scanning
                ? 'rgba(167,139,250,0.2)'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: '1px solid rgba(167,139,250,0.4)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: scanning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: scanning ? 'none' : '0 8px 20px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {scanning ? (
              <>
                <RefreshCw size={16} className="spin" />
                Touch Laptop Sensor...
              </>
            ) : (
              <>
                <Fingerprint size={18} />
                {scanError ? 'Retry Fingerprint Scan' : 'Touch Dell Fingerprint Reader'}
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fingerprintPulse {
          0% { transform: scale(0.96); opacity: 0.7; filter: drop-shadow(0 0 5px rgba(167,139,250,0.4)); }
          50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 20px rgba(167,139,250,0.8)); }
          100% { transform: scale(0.96); opacity: 0.7; filter: drop-shadow(0 0 5px rgba(167,139,250,0.4)); }
        }
      `}</style>
    </div>
  );
};

export default FingerprintModal;
