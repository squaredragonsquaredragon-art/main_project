import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: focus previous field
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      addToast('Please enter the complete 6-digit security code.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Mock code verification matching email/auth seed
      if (fullCode === '123456' || fullCode === '888888') {
        addToast('Multi-factor authorization token verified successfully!', 'success');
        navigate('/');
      } else {
        addToast('Invalid verification code. Please try again.', 'error');
        setLoading(false);
      }
    }, 1200);
  };

  const handleResend = () => {
    setTimer(60);
    addToast('A new 6-digit passkey has been routed to your registered node.', 'info');
  };

  return (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="hsl(var(--accent-orange))" />
          MFA Authentication Required
        </h2>
        <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
          We detected an unusual access fingerprint. A secure verification passcode was routed to your endpoint.
        </p>
      </div>

      {/* Code grids */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            ref={(el) => (inputRefs.current[idx] = el)}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={loading}
            style={{
              width: '46px',
              height: '52px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${digit ? 'hsl(var(--accent-cyan))' : 'hsl(var(--border-color))'}`,
              borderRadius: 'var(--border-radius-sm)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              boxShadow: digit ? 'var(--neon-glow-cyan)' : 'none',
            }}
          />
        ))}
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Decrypting Security Token...' : (
          <>
            <KeyRound size={16} />
            Verify Authorization
          </>
        )}
      </button>

      <div className="flex-between" style={{ fontSize: '13px' }}>
        <span style={{ color: 'hsl(var(--text-muted))' }}>
          {timer > 0 ? `Resend key in ${timer}s` : 'Token expired'}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || loading}
          style={{
            background: 'none',
            border: 'none',
            cursor: timer > 0 ? 'not-allowed' : 'pointer',
            color: timer > 0 ? 'hsl(var(--text-muted))' : 'hsl(var(--accent-cyan))',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={12} />
          Resend Passkey
        </button>
      </div>
    </form>
  );
};

export default OTPVerification;
