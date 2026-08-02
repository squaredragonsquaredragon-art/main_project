import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSecurityStore } from '../../store/securityStore';
import { useAuthStore } from '../../store/authStore';
import useSecurity from '../../hooks/useSecurity';
import Loader from '../../components/common/Loader';
import { ShieldCheck, ArrowRight, ShieldAlert, Cpu, Clapperboard, Wallet, MessageSquare, History } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const Home = () => {
  const { user } = useAuthStore();
  const { loginHistory, fetchLoginHistory, historyStats, fetchHistoryStats, loading } = useSecurityStore();
  const { trustIndex, deviceFingerprint } = useSecurity();
  const navigate = useNavigate();

  useEffect(() => {
    const activeApp = localStorage.getItem('sentinel_active_app');
    if (activeApp === 'payment') navigate('/payment', { replace: true });
    else if (activeApp === 'instagram') navigate('/reels', { replace: true });
    else {
      fetchLoginHistory(1, 4);
      fetchHistoryStats();
    }
  }, [fetchLoginHistory, fetchHistoryStats, navigate]);

  const quickLinks = [
    { to: '/reels', label: 'Cyber Reels', desc: 'Vertical cyberpunk streams', icon: <Clapperboard size={22} color="hsl(var(--accent-purple))" />, border: 'hsla(var(--accent-purple), 0.15)' },
    { to: '/payment', label: 'E-Wallet', desc: 'Frictionless transfers & QR', icon: <Wallet size={22} color="hsl(var(--accent-green))" />, border: 'hsla(var(--accent-green), 0.15)' },
    { to: '/messaging', label: 'Safe Chats', icon: <MessageSquare size={22} color="hsl(var(--accent-blue))" />, desc: 'Encrypted peer communications', border: 'hsla(var(--accent-blue), 0.15)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Message */}
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>
            System Terminal, <span className="text-gradient-cyan">{user?.username}</span>
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px', marginTop: '4px' }}>
            Multi-module secure digital ecosystem node active.
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px' }}>
          Biometrics Authenticated
        </span>
      </div>

      {/* Grid: Trust Metrics (ML) & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Card: Client Trust Score */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderLeft: '4px solid hsl(var(--accent-cyan))',
            boxShadow: 'var(--neon-glow-cyan)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="hsl(var(--accent-cyan))" />
            Client Identity Verification metrics
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '8px 0' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.04)',
                borderTop: '3px solid hsl(var(--accent-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                boxShadow: 'var(--neon-glow-cyan)',
                color: 'hsl(var(--accent-cyan))',
              }}
            >
              {trustIndex?.score || 100}%
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Biometric Trust Grade: {trustIndex?.grade}</span>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
                IP: Standard Web Host • Browser: {deviceFingerprint?.browser} ({deviceFingerprint?.os})
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Quick navigation options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {quickLinks.map((link, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => navigate(link.to)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                border: `1px solid ${link.border}`,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.02)' }}>
                {link.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{link.label}</span>
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{link.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recent Login History (Connected to DB) & Security Alert Widget */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Panel: Recent login attempts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="hsl(var(--accent-cyan))" />
              Recent Authorization Logs
            </h3>
            <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
              Total attempts logged: {historyStats?.total_logins || 0}
            </span>
          </div>

          {loading && loginHistory.length === 0 ? (
            <Loader message="Loading security history..." />
          ) : loginHistory && loginHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loginHistory.slice(0, 4).map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '16px' }}>
                      {log.status === 'suspicious' ? '⚠️' : '🛡️'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{log.browser} on {log.os}</span>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>IP: {log.ip_address}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      className={`badge badge-${
                        log.status === 'suspicious' ? 'danger' : log.status === 'blocked' ? 'warning' : 'success'
                      }`}
                      style={{ fontSize: '9px' }}
                    >
                      {log.status}
                    </span>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                      {formatDate(log.login_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              No login logs recorded yet.
            </div>
          )}
        </div>

        {/* Right Panel: Anomaly Warning alert card */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(255, 102, 0, 0.02)',
            border: '1px solid rgba(255, 102, 0, 0.15)',
            boxShadow: '0 8px 30px rgba(255, 102, 0, 0.03)',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '8px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255, 102, 0, 0.05)',
                width: 'fit-content',
                border: '1px solid rgba(255, 102, 0, 0.25)',
              }}
            >
              <ShieldAlert size={20} color="hsl(var(--accent-orange))" />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>MFA Risk Bulletins</h3>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6, margin: 0 }}>
              Anomalous login scoring is live. Sentinel triggers instant alert reports and security blocks if threat thresholds exceed 75/100 points.
            </p>
          </div>

          <Link
            to="/profile/security"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'hsl(var(--accent-orange))',
              fontWeight: 700,
              marginTop: '20px',
            }}
          >
            Audit Security Settings
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
