import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api/authApi';
import { Mail, ArrowLeft, Send, Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1); // 1: Send Passcode, 2: Reset Password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedPasscode, setGeneratedPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeApp, setActiveApp] = useState('all');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
  }, []);

  // Step 1: Transmit OTP reset passcode
  const handleRequestPasscode = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      addToast('Please enter your registered username or email.', 'warning');
      return;
    }
    setLoading(true);

    // Generate a random 6-digit security code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPasscode(code);
    setOtpCode(code); // pre-fill for user convenience

    setTimeout(() => {
      setLoading(false);
      setStep(2);
      addToast(`Reset passcode generated: [${code}]. Security clearance granted!`, 'info');
    }, 800);
  };

  // Step 2: Reset password and trigger back office alert
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      addToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(
        {
          username_or_email: identifier.trim(),
          new_password: newPassword,
          otp_code: otpCode,
        },
        activeApp
      );

      addToast('Password changed successfully! Security incident logged in Back Office.', 'success');
      setTimeout(() => {
        navigate('/login', { state: { prefilledUsername: identifier } });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update security credentials. Please check details.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/login"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '4px 10px',
            textDecoration: 'none',
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
        </Link>
        <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Credential Recovery
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
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            marginBottom: '8px',
            boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)',
          }}
        >
          <KeyRound size={22} color="#f43f5e" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Reset Password
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px', marginBottom: 0 }}>
          {step === 1
            ? 'Enter your account username or email to generate a security passcode.'
            : 'Enter your reset passcode and your new password.'}
        </p>
      </div>

      {step === 1 ? (
        /* STEP 1: Enter Username or Email */
        <form onSubmit={handleRequestPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Username or Registered Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email..."
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

          <button
            type="submit"
            style={{
              width: '100%',
              height: '42px',
              marginTop: '4px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            disabled={loading}
          >
            <Send size={15} />
            {loading ? 'Transmitting Key...' : 'Request Reset Passcode'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#f43f5e', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: Verification & New Password */
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Demo Banner showing generated passcode */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#38bdf8',
            }}
          >
            <CheckCircle2 size={16} />
            <div>
              Passcode transmitted for <strong>{identifier}</strong>: <code style={{ color: '#fff', fontWeight: 700 }}>{generatedPasscode}</code>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security OTP Passcode
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="6-digit passcode"
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
              <KeyRound
                size={15}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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

          <button
            type="submit"
            style={{
              width: '100%',
              height: '42px',
              marginTop: '6px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            disabled={loading}
          >
            <ShieldAlert size={16} />
            {loading ? 'Updating Credentials...' : 'Save New Password & Notify Back Office'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Change username or email
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
