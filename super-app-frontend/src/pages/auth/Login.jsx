import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Lock, LogIn, Wallet, Clapperboard, ArrowLeft, Shield } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
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
      
      if (res.user.role === 'admin') {
        navigate('/admin');
        return;
      }

      if (activeApp === 'payment') {
        navigate('/payment');
      } else if (activeApp === 'instagram') {
        navigate('/reels');
      } else {
        navigate('/');
      }
    } else {
      addToast(res.error, 'error');
      
      if (res.details?.status === 'suspicious') {
        navigate('/suspicious-login');
      }
    }
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

        <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
          New user?{' '}
          <Link to="/register" style={{ color: style.accent, fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
