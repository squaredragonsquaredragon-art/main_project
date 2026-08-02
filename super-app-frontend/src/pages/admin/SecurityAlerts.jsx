import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { BellRing, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const SecurityAlerts = () => {
  const { adminAlerts, fetchAdminAlerts, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminAlerts();
  }, [fetchAdminAlerts]);

  if (loading && adminAlerts.length === 0) {
    return <Loader message="Accessing active incident bulletins..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>System Anomaly Bulletins</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Overview of suspicious access attempts registered system-wide.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {adminAlerts && adminAlerts.length > 0 ? (
          adminAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <BellRing color="hsl(var(--accent-red))" size={18} />
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'hsl(var(--accent-red))' }}>{alert.alert_type}</span>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{formatDate(alert.created_at)}</span>
                </div>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'hsl(var(--text-secondary))' }}>{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <ShieldCheck size={32} color="hsl(var(--accent-green))" />
            <div style={{ marginTop: '8px' }}>Security bulletins empty. All nodes secure.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
