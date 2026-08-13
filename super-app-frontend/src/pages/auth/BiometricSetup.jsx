import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, ScanFace, ShieldCheck, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { registerPasskey } from '../../services/biometricService';

/**
 * BiometricSetup
 * Modal overlay for registering Face ID or Fingerprint on this device.
 *
 * Props:
 *   user        - current logged-in user object { id, username, email }
 *   type        - 'face' | 'fingerprint'
 *   onSuccess   - callback after successful registration
 *   onClose     - callback to dismiss the modal
 */
const BiometricSetup = ({ user, type = 'fingerprint', onSuccess, onClose }) => {
  const [step, setStep] = useState('intro'); // 'intro' | 'scanning' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const scanRef = useRef(null);

  const isFace = type === 'face';

  const config = {
    face: {
      icon: <ScanFace size={40} />,
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.3)',
      title: 'Set Up Face ID',
      subtitle: 'Use your device camera to authenticate instantly',
      scanLabel: 'Position your face within the frame',
      buttonLabel: 'Enable Face ID',
    },
    fingerprint: {
      icon: <Fingerprint size={40} />,
      color: '#a78bfa',
      glow: 'rgba(167, 139, 250, 0.3)',
      title: 'Set Up Fingerprint',
      subtitle: 'Touch the fingerprint sensor to authenticate instantly',
      scanLabel: 'Touch your fingerprint sensor when prompted',
      buttonLabel: 'Enable Fingerprint',
    },
  }[type];

  const handleRegister = async () => {
    setStep('scanning');
    setErrorMsg('');

    // Call the real backend-connected registerPasskey
    // user.username is the actual username, type gives us the device label
    const deviceLabel = type === 'face' ? 'Face ID' : 'Fingerprint';
    const result = await registerPasskey(user.username, deviceLabel);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 1400);
    } else {
      setErrorMsg(result.error);
      setStep('error');
    }
  };

  // Trap keyboard escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))',
          border: `1px solid ${config.color}30`,
          borderRadius: '20px',
          padding: '32px 28px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${config.color}15`,
          animation: 'slideUp 0.25s ease',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <X size={14} />
        </button>

        {/* ─── INTRO STATE ─── */}
        {step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Icon with animated glow ring */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                border: `2px solid ${config.color}40`,
                boxShadow: `0 0 30px ${config.glow}`,
                animation: 'pulseGlowCyan 2.5s infinite',
              }}>
                {config.icon}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                {config.title}
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>
                {config.subtitle}
              </p>
            </div>

            {/* Benefits list */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '14px 16px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {[
                'Instant one-touch sign in',
                'No password typing required',
                'Secured by your device hardware',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                  <ShieldCheck size={14} color={config.color} />
                  {text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              id={`biometric-setup-${type}-btn`}
              onClick={handleRegister}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${config.color}, ${isFace ? '#0284c7' : '#7c3aed'})`,
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 16px ${config.glow}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${config.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 16px ${config.glow}`; }}
            >
              {config.icon && React.cloneElement(config.icon, { size: 16 })}
              {config.buttonLabel}
            </button>

            <p style={{ margin: 0, fontSize: '11px', color: '#475569', textAlign: 'center' }}>
              Your biometric data never leaves your device.
            </p>
          </div>
        )}

        {/* ─── SCANNING STATE ─── */}
        {step === 'scanning' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '8px 0' }}>
            {isFace ? (
              /* Face scan frame animation */
              <div className="biometric-face-scan" style={{ position: 'relative', width: '120px', height: '120px' }}>
                {/* Corner brackets */}
                {['tl', 'tr', 'bl', 'br'].map(pos => (
                  <div key={pos} style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    borderColor: config.color,
                    borderStyle: 'solid',
                    borderWidth: 0,
                    ...(pos === 'tl' ? { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: '4px 0 0 0' } : {}),
                    ...(pos === 'tr' ? { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderRadius: '0 4px 0 0' } : {}),
                    ...(pos === 'bl' ? { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: '0 0 0 4px' } : {}),
                    ...(pos === 'br' ? { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: '0 0 4px 0' } : {}),
                  }} />
                ))}
                {/* Scan sweep line */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                  animation: 'biometricSweep 1.8s ease-in-out infinite',
                  boxShadow: `0 0 8px ${config.color}`,
                }} />
                {/* Center face outline */}
                <div style={{
                  position: 'absolute',
                  inset: '18px',
                  borderRadius: '50%',
                  border: `1px dashed ${config.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: `${config.color}60`,
                }}>
                  <ScanFace size={36} />
                </div>
              </div>
            ) : (
              /* Fingerprint ripple animation */
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: `${60 + i * 22}px`,
                    height: `${60 + i * 22}px`,
                    borderRadius: '50%',
                    border: `1px solid ${config.color}`,
                    opacity: 0,
                    animation: `biometricRipple 1.8s ease-out ${i * 0.5}s infinite`,
                  }} />
                ))}
                <div style={{ color: config.color, animation: 'pulseGlowCyan 1s ease-in-out infinite' }}>
                  <Fingerprint size={44} />
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', marginBottom: '6px' }}>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Waiting for biometric...
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                {config.scanLabel}
              </p>
            </div>
          </div>
        )}

        {/* ─── SUCCESS STATE ─── */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(0, 230, 118, 0.1)',
              border: '2px solid rgba(0, 230, 118, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e676',
              animation: 'scaleUp 0.3s ease',
              boxShadow: '0 0 24px rgba(0, 230, 118, 0.3)',
            }}>
              <CheckCircle2 size={36} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                {isFace ? 'Face ID' : 'Fingerprint'} Registered!
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                You can now sign in instantly.
              </p>
            </div>
          </div>
        )}

        {/* ─── ERROR STATE ─── */}
        {step === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', padding: '8px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 85, 0.1)',
              border: '2px solid rgba(255, 0, 85, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff0055',
              boxShadow: '0 0 24px rgba(255, 0, 85, 0.2)',
            }}>
              <AlertCircle size={36} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                Registration Failed
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
                {errorMsg}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: '40px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setStep('intro'); setErrorMsg(''); }}
                style={{
                  flex: 1, height: '40px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${config.color}, ${isFace ? '#0284c7' : '#7c3aed'})`,
                  border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricSetup;
