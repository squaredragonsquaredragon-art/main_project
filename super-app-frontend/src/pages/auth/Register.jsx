import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword, validateUsername, validatePhoneNumber } from '../../utils/validators';
import { Mail, Lock, User, UserCheck, Wallet, Clapperboard, ArrowLeft, Phone, Fingerprint, ScanFace, ChevronRight, X, AlertCircle } from 'lucide-react';
import { isBiometricAvailable, registerPasskey } from '../../services/biometricService';
import FaceCameraModal from '../../components/auth/FaceCameraModal';
import FingerprintModal from '../../components/auth/FingerprintModal';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [whatsappActivated, setWhatsappActivated] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuthStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  // ─── Post-registration biometric enrollment state ────────────────────────────────────────
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null); // { username, email }
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnrolling, setBiometricEnrolling] = useState(null); // 'face' | 'fingerprint' | null
  const [biometricDone, setBiometricDone] = useState(false);
  const [showFaceCameraModal, setShowFaceCameraModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
    isBiometricAvailable().then(ok => setBiometricSupported(ok));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setFormError('');

    if (!validateUsername(username)) {
      const msg = 'Username must be at least 3 alphanumeric characters.';
      addToast(msg, 'warning');
      setFormError(msg);
      return;
    }
    if (!validateEmail(email)) {
      const msg = 'Please enter a valid email address.';
      addToast(msg, 'warning');
      setFormError(msg);
      return;
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      const msg = 'Phone number is required for 📲 security & WhatsApp alerts.';
      addToast(msg, 'warning');
      setPhoneError(msg);
      setFormError(msg);
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      const msg = 'Phone number must be 10-15 digits (e.g. +919876543210).';
      addToast(msg, 'warning');
      setPhoneError(msg);
      setFormError(msg);
      return;
    }
    if (!validatePassword(password) || password.length < 8) {
      const msg = 'Security password must be at least 8 characters.';
      addToast(msg, 'warning');
      setFormError(msg);
      return;
    }
    if (!whatsappActivated) {
      const msg = 'Mandatory Step: Please click "📲 Click to Activate WhatsApp Security Alerts *" to complete security registration setup.';
      addToast(msg, 'warning');
      setWhatsappError('Activation required before proceeding.');
      setFormError(msg);
      return;
    }

    const res = await register({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber.trim(),
    });

    if (res.success) {
      addToast('Registration complete! Access credentials created in separate app datastore.', 'success');
      if (biometricSupported) {
        // Show biometric enrollment prompt before going to login
        setRegisteredUser({ username, email });
        setShowBiometricPrompt(true);
      } else {
        navigate('/login');
      }
    } else {
      const errDetail = res.error || 'Registration failed.';
      addToast(errDetail, 'error');
      setFormError(errDetail);
      if (errDetail.toLowerCase().includes('phone')) {
        setPhoneError(errDetail);
      }
    }
  };

  // ─── Biometric enrollment during registration ──────────────────────────────────────────
  const handleBiometricEnroll = async (type) => {
    if (type === 'face') {
      // Open Camera Face Scanner for Face ID registration
      setShowFaceCameraModal(true);
      return;
    }
    if (type === 'fingerprint') {
      // Open Laptop Fingerprint Sensor Modal
      setShowFingerprintModal(true);
      return;
    }
  };

  const handleFingerprintSuccess = () => {
    setShowFingerprintModal(false);
    setBiometricDone(true);
    addToast('Dell Laptop Fingerprint Profile Registered Successfully!', 'success');
    setTimeout(() => navigate('/login'), 1600);
  };

  const handleFaceCameraSuccess = () => {
    setShowFaceCameraModal(false);
    setBiometricDone(true);
    addToast('Camera Face ID Profile Registered Successfully!', 'success');
    setTimeout(() => navigate('/login'), 1600);
  };

  const getAppStyle = () => {
    switch (activeApp) {
      case 'payment':
        return {
          title: 'APEX PAY',
          subtitle: 'Create Secure Financial Wallet Keys',
          icon: <Wallet size={20} color="#10b981" />,
          accent: '#10b981',
          glow: '0 0 18px rgba(16, 185, 129, 0.25)',
          btnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        };
      case 'instagram':
        return {
          title: 'INSTAGLANCE',
          subtitle: 'Join Secure Reels & Stream Network',
          icon: <Clapperboard size={20} color="#a855f7" />,
          accent: '#a855f7',
          glow: '0 0 18px rgba(168, 85, 247, 0.25)',
          btnBg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
        };
      default:
        return {
          title: 'SENTINEL AI',
          subtitle: 'Create General Sentinel Credentials',
          icon: <UserCheck size={20} color="#38bdf8" />,
          accent: '#38bdf8',
          glow: '0 0 18px rgba(56, 189, 248, 0.25)',
          btnBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        };
    }
  };

  const style = getAppStyle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/login')}
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
        >
          <ArrowLeft size={12} />
          Back to Login
        </button>
        <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          New Account Registration
        </span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', margin: '0 0 4px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${style.accent}15`,
            border: `1px solid ${style.accent}35`,
            marginBottom: '6px',
            boxShadow: style.glow,
          }}
        >
          {style.icon}
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          {style.title} <span style={{ fontSize: '11px', color: style.accent, verticalAlign: 'super', fontWeight: 700 }}>Register</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px', marginBottom: 0 }}>
          {style.subtitle}
        </p>
      </div>

      {/* Form with 2-column grid layout for compact height */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Row 1: Username & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. cyber_sentinel"
                style={{
                  paddingLeft: '34px',
                  height: '36px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <User size={13} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                style={{
                  paddingLeft: '34px',
                  height: '36px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <Mail size={13} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Row 2: First Name & Last Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              First Name
            </label>
            <input
              type="text"
              className="glass-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Neo"
              style={{
                height: '36px',
                fontSize: '12px',
                paddingLeft: '12px',
                borderRadius: '7px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Last Name
            </label>
            <input
              type="text"
              className="glass-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Prime"
              style={{
                height: '36px',
                fontSize: '12px',
                paddingLeft: '12px',
                borderRadius: '7px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Error Alert Banner if formError exists */}
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

        {/* Row 3: Phone Number & Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: phoneError ? '#f87171' : '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Phone <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 600 }}>📲 Alerts</span> <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="glass-input"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (phoneError) setPhoneError('');
                  if (formError) setFormError('');
                }}
                placeholder="+919876543210"
                style={{
                  paddingLeft: '34px',
                  height: '36px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: phoneError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: phoneError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: phoneError ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
                }}
                required
              />
              <Phone size={13} color={phoneError ? '#f87171' : '#10b981'} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {phoneError && (
              <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                <AlertCircle size={11} color="#f87171" />
                {phoneError}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Passphrase (min 8)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  paddingLeft: '34px',
                  height: '36px',
                  fontSize: '12px',
                  borderRadius: '7px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                required
              />
              <Lock size={13} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Mandatory WhatsApp Security Alerts Activation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <button
            type="button"
            onClick={() => {
              window.open('https://web.whatsapp.com/send?phone=14155238886&text=join%20point-fierce', '_blank');
              setWhatsappActivated(true);
              setWhatsappError('');
              if (formError) setFormError('');
              addToast('WhatsApp Security Alerts Activated!', 'success');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '7px',
              background: whatsappActivated
                ? 'linear-gradient(135deg, rgba(37,211,102,0.25), rgba(16,185,129,0.15))'
                : whatsappError
                ? 'rgba(239, 68, 68, 0.12)'
                : 'linear-gradient(135deg, rgba(37,211,102,0.18), rgba(37,211,102,0.08))',
              border: whatsappActivated
                ? '1px solid rgba(37,211,102,0.6)'
                : whatsappError
                ? '1px solid #ef4444'
                : '1px solid rgba(37,211,102,0.35)',
              color: whatsappActivated ? '#10b981' : whatsappError ? '#f87171' : '#25d366',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: whatsappError ? '0 0 10px rgba(239, 68, 68, 0.35)' : whatsappActivated ? '0 0 12px rgba(37,211,102,0.25)' : 'none',
            }}
          >
            {whatsappActivated ? (
              <>
                <span>✓ WhatsApp Security Alerts Activated</span>
                <span style={{ fontSize: '9px', background: 'rgba(37,211,102,0.25)', padding: '1px 6px', borderRadius: '4px' }}>
                  Done ✓
                </span>
              </>
            ) : (
              <>
                <span>📲 Click to Activate WhatsApp Security Alerts</span>
                <span style={{ color: '#ef4444' }}>*</span>
                <span style={{ fontSize: '9px', opacity: 0.9, background: 'rgba(37,211,102,0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                  tap Send → done ✓
                </span>
              </>
            )}
          </button>
          {whatsappError && (
            <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
              <AlertCircle size={11} color="#f87171" />
              {whatsappError}
            </span>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            height: '38px',
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
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
          disabled={loading}
        >
          <UserCheck size={16} />
          {loading ? 'Encrypting details...' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '2px', fontSize: '12px', color: '#94a3b8' }}>
          Already have credentials?{' '}
          <Link to="/login" style={{ color: style.accent, fontWeight: 700, textDecoration: 'none' }}>
            Login Session
          </Link>
        </div>
      </form>

      {/* ─── Post-Registration Biometric Enrollment Modal ─── */}
      {showBiometricPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(15,23,42,0.99), rgba(8,12,24,0.99))',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '22px',
              padding: '30px 26px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 28px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.08)',
              animation: 'slideUp 0.25s ease',
              position: 'relative',
            }}
          >
            {/* Close / skip */}
            {!biometricDone && (
              <button
                onClick={() => navigate('/login')}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                }}
                title="Skip — set up later"
              >
                <X size={14} />
              </button>
            )}

            {/* Success state */}
            {biometricDone ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '10px 0' }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: 'rgba(0,230,118,0.1)', border: '2px solid rgba(0,230,118,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#00e676', fontSize: '32px',
                  boxShadow: '0 0 28px rgba(0,230,118,0.3)',
                  animation: 'scaleUp 0.3s ease',
                }}>
                  ✓
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>Biometric Enrolled!</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Redirecting to login...</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15))',
                    border: '1px solid rgba(56,189,248,0.25)',
                    marginBottom: '12px',
                    boxShadow: '0 0 28px rgba(56,189,248,0.2)',
                  }}>
                    <span style={{ fontSize: '26px' }}>🛡️</span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                    Enable Biometric Login
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12.5px', lineHeight: 1.6 }}>
                    Hi <strong style={{ color: '#f8fafc' }}>{registeredUser?.username}</strong>! Set up Face ID or Fingerprint now for instant sign-in every time.
                  </p>
                </div>

                {/* Biometric choice buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Face ID */}
                  <button
                    id="register-face-id-btn"
                    onClick={() => handleBiometricEnroll('face')}
                    disabled={biometricEnrolling !== null}
                    style={{
                      width: '100%', height: '58px', borderRadius: '12px',
                      background: biometricEnrolling === 'face'
                        ? 'rgba(56,189,248,0.2)'
                        : 'rgba(56,189,248,0.07)',
                      border: biometricEnrolling === 'face'
                        ? '1px solid rgba(56,189,248,0.7)'
                        : '1px solid rgba(56,189,248,0.22)',
                      color: '#38bdf8',
                      cursor: biometricEnrolling ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '0 18px',
                      transition: 'all 0.2s ease',
                      boxShadow: biometricEnrolling === 'face' ? '0 0 20px rgba(56,189,248,0.25)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (biometricEnrolling) return;
                      e.currentTarget.style.background = 'rgba(56,189,248,0.13)';
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)';
                    }}
                    onMouseLeave={e => {
                      if (biometricEnrolling === 'face') return;
                      e.currentTarget.style.background = 'rgba(56,189,248,0.07)';
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.22)';
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: 'rgba(56,189,248,0.12)',
                      border: '1px solid rgba(56,189,248,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      animation: biometricEnrolling === 'face' ? 'pulseGlowCyan 1s infinite' : 'none',
                    }}>
                      <ScanFace size={20} />
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {biometricEnrolling === 'face' ? 'Scanning face...' : 'Set Up Face ID'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                        Use your camera for instant recognition
                      </div>
                    </div>
                    {!biometricEnrolling && <ChevronRight size={16} color="#64748b" />}
                  </button>

                  {/* Fingerprint */}
                  <button
                    id="register-fingerprint-btn"
                    onClick={() => handleBiometricEnroll('fingerprint')}
                    disabled={biometricEnrolling !== null}
                    style={{
                      width: '100%', height: '58px', borderRadius: '12px',
                      background: biometricEnrolling === 'fingerprint'
                        ? 'rgba(167,139,250,0.2)'
                        : 'rgba(167,139,250,0.07)',
                      border: biometricEnrolling === 'fingerprint'
                        ? '1px solid rgba(167,139,250,0.7)'
                        : '1px solid rgba(167,139,250,0.22)',
                      color: '#a78bfa',
                      cursor: biometricEnrolling ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '0 18px',
                      transition: 'all 0.2s ease',
                      boxShadow: biometricEnrolling === 'fingerprint' ? '0 0 20px rgba(167,139,250,0.25)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (biometricEnrolling) return;
                      e.currentTarget.style.background = 'rgba(167,139,250,0.13)';
                      e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                    }}
                    onMouseLeave={e => {
                      if (biometricEnrolling === 'fingerprint') return;
                      e.currentTarget.style.background = 'rgba(167,139,250,0.07)';
                      e.currentTarget.style.borderColor = 'rgba(167,139,250,0.22)';
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: 'rgba(167,139,250,0.12)',
                      border: '1px solid rgba(167,139,250,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      animation: biometricEnrolling === 'fingerprint' ? 'biometricPulse 0.8s infinite' : 'none',
                    }}>
                      <Fingerprint size={20} />
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {biometricEnrolling === 'fingerprint' ? 'Scanning fingerprint...' : 'Set Up Fingerprint'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                        Touch your device sensor
                      </div>
                    </div>
                    {!biometricEnrolling && <ChevronRight size={16} color="#64748b" />}
                  </button>
                </div>

                {/* Skip link */}
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'none', border: 'none', color: '#475569',
                    fontSize: '12px', cursor: 'pointer', textAlign: 'center',
                    padding: '4px', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
                >
                  Skip — I'll set this up later
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Camera Face Registration Modal ─── */}
      {showFaceCameraModal && registeredUser && (
        <FaceCameraModal
          mode="register"
          username={registeredUser.username}
          onSuccess={handleFaceCameraSuccess}
          onClose={() => setShowFaceCameraModal(false)}
        />
      )}

      {/* ─── Dell Laptop Fingerprint Sensor Registration Modal ─── */}
      {showFingerprintModal && registeredUser && (
        <FingerprintModal
          mode="register"
          username={registeredUser.username}
          onSuccess={handleFingerprintSuccess}
          onClose={() => setShowFingerprintModal(false)}
        />
      )}
    </div>
  );
};

export default Register;
