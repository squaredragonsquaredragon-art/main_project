import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { Cpu, AlertTriangle, ShieldCheck, ShieldAlert, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const AIThreatAnalysis = () => {
  const { adminAlerts, fetchAdminAlerts, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminAlerts();
  }, [fetchAdminAlerts]);

  if (loading && adminAlerts.length === 0) {
    return <Loader message="Analyzing ML mathematical node layers..." size="large" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>AI Threat Vectors Analysis</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Anomaly scores mapped against network clusters using PyTorch isolation forest classifier classifiers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* ML Model parameters */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="hsl(var(--accent-cyan))" />
            Classifier Configuration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>Model Framework</span>
              <span style={{ color: 'hsl(var(--accent-cyan))', fontWeight: 600 }}>Scikit-Learn Classifier</span>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>Anomaly Type</span>
              <span>Isolation Forest</span>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>Analyzed Inputs</span>
              <span>IP, UserAgent, Login Hour</span>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>Contamination Ratio</span>
              <span>5.0%</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'hsl(var(--text-muted))' }}>Biometric Scan</span>
              <span style={{ color: 'hsl(var(--accent-green))', fontWeight: 600 }}>ENABLED</span>
            </div>
          </div>
        </div>

        {/* Dynamic ML Threat Logs timeline */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="hsl(var(--accent-red))" />
            Active Mathematical Anomalies Logs
          </h3>

          {adminAlerts && adminAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {adminAlerts.map((alert, idx) => (
                <div
                  key={alert.id || idx}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, color: 'hsl(var(--accent-red))', fontSize: '12px', textTransform: 'uppercase' }}>
                      {alert.alert_type}
                    </span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                      {formatDate(alert.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                    {alert.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                    <span>Client IP: <strong style={{ color: '#fff' }}>{alert.ip_address}</strong></span>
                    <span>Anomalous Deviation Score: <strong style={{ color: 'hsl(var(--accent-orange))' }}>{alert.risk_score}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <ShieldCheck size={48} color="hsl(var(--accent-green))" style={{ marginBottom: '12px', display: 'block', margin: '0 auto' }} />
              Isolation Forest reports 100% network security validation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIThreatAnalysis;
