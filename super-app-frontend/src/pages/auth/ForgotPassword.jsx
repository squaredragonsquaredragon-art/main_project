import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api/authApi';
import { Mail, ArrowLeft, Send, Lock, KeyRound, ShieldAlert, CheckCircle2, Phone, MessageSquare } from 'lucide-react';

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

  // Step 1: Request 6-digit OTP to user WhatsApp / Phone number
  const handleRequestPasscode = async (e) => {
    e.preventDefault();
    if (!identifier || !identifier.trim()) {
      addToast('Please enter your registered phone number, username, or email.', 'warning');
      return;
    }
    setLoading(true);
    setOtpCode('');

    try {
      const res = await authApi.requestPasswordResetOtp(identifier.trim(), activeApp);
      setGeneratedPasscode(res.otp_code || '');
      setStep(2);
      addToast(
        res.otp_code
          ? `WhatsApp Security OTP: [ ${res.otp_code} ]. Enter code to reset password!`
          : (res.message || 'Security OTP sent to your registered WhatsApp number!'),
        'success'
      );
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'No account found matching given phone number, username, or email.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode || !otpCode.trim()) {
      addToast('Security OTP verification code is mandatory.', 'warning');
      return;
    }
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
          otp_code: otpCode.trim(),
        },
        activeApp
      );

      addToast('Password changed successfully! Security incident logged in Back Office.', 'success');
      setTimeout(() => {
        navigate('/login', { state: { prefilledUsername: identifier } });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update security credentials. Invalid or expired OTP.';
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            marginBottom: '8px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
          }}
        >
          <MessageSquare size={22} color="#10b981" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Reset Password
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px', marginBottom: 0 }}>
          {step === 1
            ? 'Enter your registered Phone Number or Username to receive a 6-digit WhatsApp Security OTP.'
            : 'Enter the 6-digit OTP code received on WhatsApp and create your new password.'}
        </p>
      </div>

      {step === 1 ? (
        /* STEP 1: Enter Phone Number or Username */
        <form onSubmit={handleRequestPasscode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              REGISTERED PHONE / WHATSAPP NUMBER <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter phone number (e.g. +919876543210 or 9876543210)..."
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
              <Phone
                size={15}
                color="#10b981"
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            disabled={loading}
          >
            <MessageSquare size={15} />
            {loading ? 'Sending WhatsApp OTP...' : 'Send WhatsApp Security OTP 📲'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: Verification & New Password */
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Banner */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#34d399',
            }}
          >
            <CheckCircle2 size={16} />
            <div>
              WhatsApp OTP transmitted for <strong>{identifier}</strong>. {generatedPasscode && <span>Security OTP Code: <code style={{ color: '#10b981', fontWeight: 800 }}>[ {generatedPasscode} ]</code></span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              6-DIGIT WHATSAPP OTP CODE <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP code..."
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
                color="#10b981"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              NEW PASSWORD <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters..."
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
              CONFIRM NEW PASSWORD <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            disabled={loading}
          >
            <ShieldAlert size={16} />
            {loading ? 'Updating Password...' : 'Verify OTP & Save New Password 🛡️'}
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
            Change phone number or username
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
