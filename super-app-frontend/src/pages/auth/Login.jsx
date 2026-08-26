import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import {
  Mail, Lock, LogIn, Wallet, Clapperboard, ArrowLeft, Shield,
  Fingerprint, ScanFace, AlertCircle, ShieldCheck, X, Sparkles, Key
} from 'lucide-react';
import { isBiometricAvailable } from '../../services/biometricService';
import { authApi } from '../../api/authApi';
import FaceCameraModal from '../../components/auth/FaceCameraModal';
import FingerprintModal from '../../components/auth/FingerprintModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Inline field error states
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const { login, loading } = useAuthStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeApp, setActiveApp] = useState('all');

  // ─── Biometric state ─────────────────────────────────────────────────────
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [showBiometricSelector, setShowBiometricSelector] = useState(false);
  const [showFaceCameraModal, setShowFaceCameraModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
    if (location.state?.prefilledUsername) {
      setUsername(location.state.prefilledUsername);
    }
    isBiometricAvailable().then(available => setBiometricSupported(available));
  }, [location.state]);

  // ─── Step 1: Validate Username & Password before Biometric prompt ─────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    let valid = true;
    if (!username || !username.trim()) {
      setUsernameError('Username or Email is mandatory.');
      valid = false;
    }
    if (!password || !password.trim()) {
      setPasswordError('Password is mandatory.');
      valid = false;
    }

    if (!valid) {
      const msg = 'Username/Email and Password are both mandatory.';
      addToast(msg, 'warning');
      setFormError(msg);
      return;
    }

    // MANDATORY REQUIREMENT: VERIFY CREDENTIALS FIRST BEFORE FACE ID / FINGERPRINT MODAL
    try {
      await authApi.verifyCredentials({ username: username.trim(), password }, activeApp);
      // Both credentials are valid! Proceed to Face ID / Fingerprint verification!
      setShowBiometricSelector(true);
      addToast('Credentials Verified! Select Face ID or Fingerprint to complete sign in.', 'info');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Invalid Username/Email or Password credentials.';
      setFormError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  // ─── Step 2: Finalize login after Biometric verification succeeds ────────
  const finalizeLogin = async () => {
    try {
      const res = await login({ username: username.trim(), password });
      if (res.success) {
        addToast(`Mandatory Multi-Factor Authentication Verified! Welcome back, ${res.user.username}!`, 'success');
        redirectAfterLogin(res.user);
      } else {
        const errorMsg = res.error || 'Authentication failed. Please verify credentials.';
        setFormError(errorMsg);
        addToast(errorMsg, 'error');
        if (res.details?.status === 'suspicious') {
          navigate('/suspicious-login');
        }
      }
    } catch (err) {
      const msg = err.message || 'Login failed.';
      setFormError(msg);
      addToast(msg, 'error');
    }
  };

  // ─── Shared redirect helper ───────────────────────────────────────────────
  const redirectAfterLogin = (user) => {
    if (user.role === 'admin') { navigate('/admin'); return; }
    if (activeApp === 'payment') navigate('/payment');
    else if (activeApp === 'instagram') navigate('/reels');
    else navigate('/');
  };

  // ─── Biometric Click Handlers ─────────────────────────────────────────────
  const triggerBiometricScan = (type) => {
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    if (!username.trim()) {
      setUsernameError('Username or Email is required for biometric authentication.');
      setFormError('Username or Email is mandatory before scanning biometrics.');
      addToast('Please enter your Username or Email above first.', 'warning');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Password is required.');
      setFormError('Password is mandatory for complete session authentication.');
      addToast('Please enter your Password above first.', 'warning');
      return;
    }

    setShowBiometricSelector(false);
    if (type === 'face') {
      setShowFaceCameraModal(true);
    } else if (type === 'fingerprint') {
      setShowFingerprintModal(true);
    }
  };

  const handleFaceCameraSuccess = (data) => {
    setShowFaceCameraModal(false);
    finalizeLogin();
  };

  const handleFingerprintSuccess = (data) => {
    setShowFingerprintModal(false);
    finalizeLogin();
  };

  const getAppStyle = () => {
    switch (activeApp) {
      case 'payment':
        return {
          title: 'APEX PAY',
          subtitle: 'Secure Decentralized Capital Portal',
          icon: <Wallet size={22} color="#10b981" />,
          accent: '#10b981',
          glow: '0 0 20px rgba(16, 185, 129, 0.25)',
          btnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        };
      case 'instagram':
        return {
          title: 'INSTAGLANCE',
          subtitle: 'Secure Peer Media & Social Stream',
          icon: <Clapperboard size={22} color="#a855f7" />,
          accent: '#a855f7',
          glow: '0 0 20px rgba(168, 85, 247, 0.25)',
          btnBg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
        };
      default:
        return {
          title: 'SENTINEL AI',
          subtitle: 'Multi-App Authentication Console',
          icon: <Shield size={22} color="#38bdf8" />,
          accent: '#38bdf8',
          glow: '0 0 20px rgba(56, 189, 248, 0.25)',
          btnBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        };
    }
  };

  const style = getAppStyle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '4px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            localStorage.removeItem('sentinel_active_app');
            window.location.href = '/';
          }}
        >
          <ArrowLeft size={12} />
          Portal
        </button>
        <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Mandatory MFA Authentication
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', margin: '2px 0 4px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `${style.accent}15`,
            border: `1px solid ${style.accent}35`,
            marginBottom: '8px',
            boxShadow: style.glow,
          }}
        >
          {style.icon}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          {style.title}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px', marginBottom: 0 }}>
          {style.subtitle}
        </p>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
          <span>{formError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Username / Email field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: usernameError ? '#f87171' : '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Username or Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="glass-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError('');
                if (formError) setFormError('');
              }}
              placeholder="Enter username or email..."
              style={{
                paddingLeft: '38px',
                height: '40px',
                fontSize: '13px',
                borderRadius: '8px',
                background: usernameError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: usernameError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: usernameError ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
              }}
              disabled={loading}
              required
            />
            <Mail
              size={15}
              color={usernameError ? '#f87171' : '#64748b'}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          {usernameError && (
            <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <AlertCircle size={11} color="#f87171" />
              {usernameError}
            </span>
          )}
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: passwordError ? '#f87171' : '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', alignItems: 'center' }}>
              <Link
                to="/forgot-username"
                style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = style.accent}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                Forgot Username?
              </Link>
              <span style={{ color: '#475569' }}>|</span>
              <Link
                to="/forgot-password"
                style={{ color: style.accent, textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                if (formError) setFormError('');
              }}
              placeholder="••••••••"
              style={{
                paddingLeft: '38px',
                height: '40px',
                fontSize: '13px',
                borderRadius: '8px',
                background: passwordError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: passwordError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: passwordError ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
              }}
              disabled={loading}
              required
            />
            <Lock
              size={15}
              color={passwordError ? '#f87171' : '#64748b'}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          {passwordError && (
            <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <AlertCircle size={11} color="#f87171" />
              {passwordError}
            </span>
          )}
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            height: '42px',
            marginTop: '4px',
            borderRadius: '8px',
            background: style.btnBg,
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: style.glow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          disabled={loading}
        >
          <LogIn size={16} />
          {loading ? 'Authenticating...' : 'Sign In (Step 1 of 2)'}
        </button>

        {/* ─── Biometric Quick Buttons ─── */}
        {biometricSupported && (
          <>
            {/* OR Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Mandatory Step 2 Biometric Scan
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Face ID + Fingerprint buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Face ID Button */}
              <button
                id="login-face-id-btn"
                type="button"
                onClick={() => triggerBiometricScan('face')}
                disabled={loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (loading) return;
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ScanFace size={20} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                  Scan Face ID
                </span>
              </button>

              {/* Fingerprint Button */}
              <button
                id="login-fingerprint-btn"
                type="button"
                onClick={() => triggerBiometricScan('fingerprint')}
                disabled={loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(167, 139, 250, 0.06)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  color: '#a78bfa',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (loading) return;
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(167, 139, 250, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Fingerprint size={20} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                  Scan Fingerprint
                </span>
              </button>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
          New user?{' '}
          <Link to="/register" style={{ color: style.accent, fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </form>

      {/* ─── Mandatory Biometric Selector Modal ─── */}
      {showBiometricSelector && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 10, 20, 0.88)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(8,12,24,0.99))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '22px',
              padding: '26px 22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(56,189,248,0.15)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Close */}
            <button
              onClick={() => {
                setShowBiometricSelector(false);
                addToast('Biometric verification cancelled. Login incomplete.', 'warning');
              }}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(167,139,250,0.2))',
                border: '1px solid rgba(56,189,248,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 0 25px rgba(56,189,248,0.25)',
                color: '#38bdf8',
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
              Step 2: Biometric Verification
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              Credentials verified for <strong style={{ color: '#38bdf8' }}>{username}</strong>. Choose Face ID or Fingerprint scan to authorize session access.
            </p>

            {/* Choice Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => triggerBiometricScan('face')}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
                }}
              >
                <ScanFace size={20} />
                Verify with Face ID Camera
              </button>

              <button
                type="button"
                onClick={() => triggerBiometricScan('fingerprint')}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 0 20px rgba(167, 139, 250, 0.25)',
                }}
              >
                <Fingerprint size={20} />
                Verify with Laptop Fingerprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Camera Facial Verification Login Modal ─── */}
      {showFaceCameraModal && (
        <FaceCameraModal
          mode="verify"
          username={username}
          onSuccess={handleFaceCameraSuccess}
          onClose={() => setShowFaceCameraModal(false)}
        />
      )}

      {/* ─── Laptop Fingerprint Sensor Verification Login Modal ─── */}
      {showFingerprintModal && (
        <FingerprintModal
          mode="verify"
          username={username}
          onSuccess={handleFingerprintSuccess}
          onClose={() => setShowFingerprintModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
