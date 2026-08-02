import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please input email key.', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addToast('Cryptographic reset keys routed to your node address.', 'success');
      navigate('/login');
    }, 1200);
  };

  return (
    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Reset Security Credentials</h2>
        <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
          Enter your registered node address to transmit reset tokens.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
          Registered Email
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="email"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@sentinel.local"
            style={{ paddingLeft: '44px' }}
            disabled={loading}
          />
          <Mail
            size={16}
            color="hsl(var(--text-muted))"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Transmitting Key...' : (
          <>
            <Send size={14} />
            Transmit Reset Passcode
          </>
        )}
      </button>

      <div style={{ textAlign: 'center' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'hsl(var(--text-muted))',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--accent-cyan))'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-muted))'}
        >
          <ArrowLeft size={14} />
          Return to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPassword;
