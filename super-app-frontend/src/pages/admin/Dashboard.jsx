import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { ShieldAlert, Users, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const Dashboard = () => {
  const { adminStats, fetchAdminStats, adminAlerts, fetchAdminAlerts, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminStats();
    fetchAdminAlerts();
  }, [fetchAdminStats, fetchAdminAlerts]);

  if (loading && !adminStats) {
    return <Loader message="Decrypting Sentinel threat monitoring logs..." size="large" />;
  }

  const statCards = [
    {
      label: 'Security Node Users',
      value: adminStats?.total_users || 0,
      footer: `${adminStats?.active_users || 0} active, ${adminStats?.blocked_users || 0} blocked`,
      icon: <Users size={24} color="hsl(var(--accent-cyan))" />,
      glow: 'var(--neon-glow-cyan)'
    },
    {
      label: 'Total Analyzed Logins',
      value: adminStats?.total_logins || 0,
      footer: 'Scanned via ML models',
      icon: <Clock size={24} color="hsl(var(--accent-blue))" />,
      glow: '0 0 15px rgba(26, 140, 255, 0.2)'
    },
    {
      label: 'Anomalous Logs Detect',
      value: adminStats?.total_suspicious || 0,
      footer: 'Quarantined sessions',
      icon: <ShieldAlert size={24} color="hsl(var(--accent-red))" />,
      glow: 'var(--neon-glow-red)',
      danger: true
    },
    {
      label: 'Sentinel Threat Metric',
      value: adminStats?.total_users > 0 ? `${Math.round(((adminStats?.total_suspicious || 0) / (adminStats?.total_logins || 1)) * 100)}%` : '0%',
      footer: 'Anomaly density ratio',
      icon: <Activity size={24} color="hsl(var(--accent-purple))" />,
      glow: 'var(--neon-glow-purple)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Sentinel AI Operations</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Real-time machine learning threat logs indexer & network anomaly monitoring terminal.
        </p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid-cols-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderLeft: `4px solid ${card.danger ? 'hsl(var(--accent-red))' : 'rgba(255,255,255,0.08)'}`,
              boxShadow: card.glow,
            }}
          >
            <div className="flex-between">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
                {card.label}
              </span>
              {card.icon}
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
              {card.footer}
            </div>
          </div>
        ))}
      </div>

      {/* Main admin panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Side: Recent Threat Alerts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="hsl(var(--accent-red))" />
              Live Security Bulletins (Anomalies)
            </h3>
            <span className="badge badge-danger">Real-time scan</span>
          </div>

          {adminAlerts && adminAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {adminAlerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'rgba(255, 0, 85, 0.02)',
                    border: '1px solid rgba(255, 0, 85, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, color: 'hsl(var(--accent-red))', textTransform: 'uppercase', fontSize: '12px' }}>
                      {alert.alert_type}
                    </span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                      {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                    {alert.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                    <span>IP: {alert.ip_address}</span>
                    <span>Risk Index: {alert.risk_score}/100</span>
                    <span>Severity: <strong style={{ color: alert.severity === 'high' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-orange))' }}>{alert.severity}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <ShieldCheck size={48} color="hsl(var(--accent-green))" style={{ marginBottom: '12px', display: 'block', margin: '0 auto' }} />
              No threat anomaly vectors identified on the network.
            </div>
          )}
        </div>

        {/* Right Side: Operations Control Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            Sentinel Controls
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                fontSize: '13px',
              }}
            >
              <strong>ML Model status:</strong> Active
              <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                Anomaly threshold: <strong>&gt;= 75 risk</strong>
              </div>
            </div>
            
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(0, 230, 118, 0.03)',
                border: '1px solid rgba(0, 230, 118, 0.15)',
                fontSize: '13px',
              }}
            >
              <strong>SMTP Mailer:</strong> Ready
              <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                Alert broadcasts active
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255, 102, 0, 0.03)',
                border: '1px solid rgba(255, 102, 0, 0.15)',
                fontSize: '13px',
              }}
            >
              <strong>Security Level:</strong> Standard
              <div style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>
                MFA blocks active on risk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
