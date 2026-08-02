import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { ShieldAlert } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const AttackLogs = () => {
  const { adminAlerts, fetchAdminAlerts, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminAlerts();
  }, [fetchAdminAlerts]);

  if (loading && adminAlerts.length === 0) {
    return <Loader message="Accessing network quarantine log stream..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Incident Logs Stream</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Timeline of blocked login anomalies and brute force signatures flagged by Sentinel firewall.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {adminAlerts && adminAlerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {adminAlerts.map((alert, idx) => (
              <div
                key={alert.id || idx}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'rgba(255, 0, 85, 0.01)',
                  border: '1px solid rgba(255, 0, 85, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <ShieldAlert color="hsl(var(--accent-red))" size={20} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{alert.alert_type}</span>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>{alert.description}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                  <div>IP: {alert.ip_address}</div>
                  <div>{formatDate(alert.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            No incident reports registered.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackLogs;
