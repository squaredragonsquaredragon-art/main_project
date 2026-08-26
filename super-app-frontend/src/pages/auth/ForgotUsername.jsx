import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api/authApi';
import { Mail, ArrowLeft, Search, UserCheck, Copy, Check } from 'lucide-react';

const ForgotUsername = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveredUser, setRecoveredUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeApp, setActiveApp] = useState('all');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
  }, []);

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      addToast('Please enter your registered email address.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.forgotUsername(email.trim(), activeApp);
      setRecoveredUser(data.username);
      addToast('Account matched! Username located.', 'success');
    } catch (err) {
      const msg = err.response?.data?.detail || 'No registered account found matching that email address.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (recoveredUser) {
      navigator.clipboard.writeText(recoveredUser);
      setCopied(true);
      addToast('Username copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
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
          Account Recovery
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
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            marginBottom: '8px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
          }}
        >
          <UserCheck size={22} color="#38bdf8" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Recover Username
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px', marginBottom: 0 }}>
          Enter your registered node email address to locate your handle.
        </p>
      </div>

      {recoveredUser ? (
        /* Success State Display Card */
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
            Account Located Successfully!
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
              {recoveredUser}
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                color: copied ? '#10b981' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login', { state: { prefilledUsername: recoveredUser } })}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Proceed to Login with Username
          </button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Registered Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="glass-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@sentinel.local"
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            disabled={loading}
          >
            <Search size={16} />
            {loading ? 'Locating Username...' : 'Find Username'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
            Remembered your credentials?{' '}
            <Link to="/login" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotUsername;
