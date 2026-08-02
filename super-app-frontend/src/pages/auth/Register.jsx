import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validators';
import { Mail, Lock, User, UserCheck, Wallet, Clapperboard, ArrowLeft, Phone } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { register, loading } = useAuthStore();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      addToast('Username must be at least 3 alphanumeric characters.', 'warning');
      return;
    }
    if (!validateEmail(email)) {
      addToast('Please enter a valid email address.', 'warning');
      return;
    }
    if (!validatePassword(password) || password.length < 8) {
      addToast('Security password must be at least 8 characters.', 'warning');
      return;
    }

    const res = await register({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
    });

    if (res.success) {
      addToast('Registration complete! Access credentials created in separate app datastore.', 'success');
      navigate('/login');
    } else {
      addToast(res.error, 'error');
    }
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

        {/* Row 3: Phone Number & Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Phone <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 600 }}>📲 Alerts</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="glass-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
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
              />
              <Phone size={13} color="#10b981" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
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

        {/* WhatsApp Sandbox Link if Phone entered */}
        {phoneNumber.trim().length >= 10 && (
          <a
            href={`https://web.whatsapp.com/send?phone=14155238886&text=join%20point-fierce`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, rgba(37,211,102,0.18), rgba(37,211,102,0.08))',
              border: '1px solid rgba(37,211,102,0.3)',
              color: '#25d366',
              fontSize: '11px',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span>📲 Click to Activate WhatsApp Security Alerts</span>
            <span style={{ fontSize: '9px', opacity: 0.8, fontWeight: 400, background: 'rgba(37,211,102,0.2)', padding: '1px 5px', borderRadius: '3px' }}>
              tap Send → done ✓
            </span>
          </a>
        )}

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
    </div>
  );
};

export default Register;
