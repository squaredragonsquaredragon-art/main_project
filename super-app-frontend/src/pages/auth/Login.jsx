import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Lock, LogIn, Wallet, Clapperboard, ArrowLeft, Shield, Fingerprint, ScanFace } from 'lucide-react';
import { isBiometricAvailable, registerPasskey } from '../../services/biometricService';
import BiometricSetup from './BiometricSetup';
import FaceCameraModal from '../../components/auth/FaceCameraModal';
import FingerprintModal from '../../components/auth/FingerprintModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, loginWithBiometric } = useAuthStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  // ─── Biometric state ─────────────────────────────────────────────────────
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricSetupModal, setBiometricSetupModal] = useState(null); // 'face' | 'fingerprint' | null
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showFaceCameraModal, setShowFaceCameraModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
    // Check biometric support asynchronously
    isBiometricAvailable().then(available => setBiometricSupported(available));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Please enter both credentials.', 'warning');
      return;
    }

    const res = await login({ username, password });
    if (res.success) {
      addToast(`Session decrypted successfully. Welcome back, ${res.user.username}!`, 'success');
      redirectAfterLogin(res.user);
    } else {
      addToast(res.error, 'error');
      if (res.details?.status === 'suspicious') {
        navigate('/suspicious-login');
      }
    }
  };

  // ─── Shared redirect helper ───────────────────────────────────────────────
  const redirectAfterLogin = (user) => {
    if (user.role === 'admin') { navigate('/admin'); return; }
    if (activeApp === 'payment') navigate('/payment');
    else if (activeApp === 'instagram') navigate('/reels');
    else navigate('/');
  };

  // ─── Biometric handlers ───────────────────────────────────────────────────
  const handleBiometricClick = (type) => {
    if (!username.trim()) {
      addToast('Enter your username above first, then tap Face ID / Fingerprint.', 'warning');
      return;
    }
    if (type === 'face') {
      // Open Live Camera Facial Recognition Modal!
      setShowFaceCameraModal(true);
      return;
    }
    if (type === 'fingerprint') {
      // Open Laptop Fingerprint Sensor Modal!
      setShowFingerprintModal(true);
      return;
    }
    // WebAuthn fallback
    handleBiometricAuth(type);
  };

  const handleFingerprintSuccess = (data) => {
    setShowFingerprintModal(false);
    if (data.access && data.refresh && data.user) {
      localStorage.setItem('sentinel_access_token', data.access);
      localStorage.setItem('sentinel_refresh_token', data.refresh);
      useAuthStore.setState({ user: data.user, accessToken: data.access, refreshToken: data.refresh });
      addToast(`Fingerprint Verified! Welcome back, ${data.user.username}!`, 'success');
      redirectAfterLogin(data.user);
    }
  };

  const handleFaceCameraSuccess = (data) => {
    setShowFaceCameraModal(false);
    // Save tokens and session to store
    localStorage.setItem('sentinel_access_token', data.access);
    localStorage.setItem('sentinel_refresh_token', data.refresh);
    useAuthStore.setState({ user: data.user, accessToken: data.access, refreshToken: data.refresh });
    addToast(`Face Verified (${data.similarity_score}% match). Welcome back, ${data.user.username}!`, 'success');
    redirectAfterLogin(data.user);
  };

  // Called when BiometricSetup completes enrollment
  const handleBiometricSetupSuccess = async (type) => {
    setBiometricSetupModal(null);
    addToast(`${type === 'face' ? 'Face ID' : 'Fingerprint'} registered! Signing you in...`, 'success');
    // Now authenticate with the newly registered passkey
    setTimeout(() => handleBiometricAuth(type), 500);
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
          Secure Authentication
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', margin: '2px 0 6px' }}>
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

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Username or Email
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="glass-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter credentials..."
              style={{
                paddingLeft: '38px',
                height: '40px',
                fontSize: '13px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box'
              }}
              disabled={loading}
              required
            />
            <Mail
              size={15}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                paddingLeft: '38px',
                height: '40px',
                fontSize: '13px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box'
              }}
              disabled={loading}
              required
            />
            <Lock
              size={15}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* ─── Sign In Button (existing, unchanged) ─── */}
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
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        {/* ─── Biometric Section ─── */}
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
                or use biometrics
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Face ID + Fingerprint buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Face ID Button */}
              <button
                id="login-face-id-btn"
                type="button"
                onClick={() => handleBiometricClick('face')}
                disabled={biometricLoading !== false || loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: biometricLoading === 'face'
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'rgba(56, 189, 248, 0.06)',
                  border: biometricLoading === 'face'
                    ? '1px solid rgba(56, 189, 248, 0.6)'
                    : '1px solid rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  cursor: biometricLoading || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  transition: 'all 0.2s ease',
                  boxShadow: biometricLoading === 'face' ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
                }}
                onMouseEnter={e => {
                  if (biometricLoading || loading) return;
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.2)';
                }}
                onMouseLeave={e => {
                  if (biometricLoading === 'face') return;
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ScanFace
                  size={20}
                  style={{
                    animation: biometricLoading === 'face' ? 'pulseGlowCyan 1s ease-in-out infinite' : 'none',
                  }}
                />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                  {biometricLoading === 'face' ? 'Scanning...' : 'Face ID'}
                </span>
              </button>

              {/* Fingerprint Button */}
              <button
                id="login-fingerprint-btn"
                type="button"
                onClick={() => handleBiometricClick('fingerprint')}
                disabled={biometricLoading !== false || loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '10px',
                  background: biometricLoading === 'fingerprint'
                    ? 'rgba(167, 139, 250, 0.15)'
                    : 'rgba(167, 139, 250, 0.06)',
                  border: biometricLoading === 'fingerprint'
                    ? '1px solid rgba(167, 139, 250, 0.6)'
                    : '1px solid rgba(167, 139, 250, 0.2)',
                  color: '#a78bfa',
                  cursor: biometricLoading || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  transition: 'all 0.2s ease',
                  boxShadow: biometricLoading === 'fingerprint' ? '0 0 16px rgba(167, 139, 250, 0.25)' : 'none',
                }}
                onMouseEnter={e => {
                  if (biometricLoading || loading) return;
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(167, 139, 250, 0.2)';
                }}
                onMouseLeave={e => {
                  if (biometricLoading === 'fingerprint') return;
                  e.currentTarget.style.background = 'rgba(167, 139, 250, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Fingerprint
                  size={20}
                  style={{
                    animation: biometricLoading === 'fingerprint' ? 'biometricPulse 0.8s ease-in-out infinite' : 'none',
                  }}
                />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}>
                  {biometricLoading === 'fingerprint' ? 'Scanning...' : 'Fingerprint'}
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

      {/* ─── Biometric Setup Modal ─── */}
      {biometricSetupModal && (
        <BiometricSetup
          user={{ id: username || 'device_user', username: username || 'sentinel_user' }}
          type={biometricSetupModal}
          onSuccess={() => handleBiometricSetupSuccess(biometricSetupModal)}
          onClose={() => setBiometricSetupModal(null)}
        />
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
