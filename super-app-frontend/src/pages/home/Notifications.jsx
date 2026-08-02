import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { Bell, ShieldAlert, CheckSquare } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const Notifications = () => {
  const { alerts, fetchAlerts, markAsRead, markAllAsRead, loading } = useSecurityStore();

  useEffect(() => {
    fetchAlerts(1, 20);
  }, [fetchAlerts]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  if (loading && alerts.length === 0) {
    return <Loader message="Accessing active security bulletins..." size="large" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Security Bulletins</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
            System logs alert records, Gmail notifications, and multi-factor threat warnings.
          </p>
        </div>

        {alerts && alerts.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CheckSquare size={14} />
            Mark All Read
          </button>
        )}
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts && alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => !alert.is_read && markAsRead(alert.id)}
              style={{
                padding: '16px',
                borderRadius: 'var(--border-radius-sm)',
                background: alert.is_read ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 0, 85, 0.03)',
                border: alert.is_read ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid rgba(255, 0, 85, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: alert.is_read ? 'default' : 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: alert.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(255,0,85,0.1)',
                }}
              >
                <ShieldAlert size={18} color={alert.is_read ? 'hsl(var(--text-muted))' : 'hsl(var(--accent-red))'} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 700, fontSize: '13px', color: alert.is_read ? 'hsl(var(--text-secondary))' : 'hsl(var(--accent-red))' }}>
                    {alert.alert_type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                    {formatDate(alert.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: alert.is_read ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))' }}>
                  {alert.description}
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                  <span>Source IP: {alert.ip_address}</span>
                  <span>Risk score: {alert.risk_score}/100</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <Bell size={42} style={{ marginBottom: '12px', opacity: 0.4, display: 'block', margin: '0 auto' }} />
            No security bulletins registered. All credentials secured.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
