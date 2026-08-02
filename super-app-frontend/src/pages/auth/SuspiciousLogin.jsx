import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

const SuspiciousLogin = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          padding: '16px',
          borderRadius: '50%',
          background: 'rgba(255, 0, 85, 0.05)',
          border: '1px solid rgba(255, 0, 85, 0.25)',
          boxShadow: 'var(--neon-glow-red)',
          margin: '0 auto',
        }}
      >
        <ShieldAlert size={42} color="hsl(var(--accent-red))" />
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--accent-red))', marginBottom: '8px' }}>
          ACCESS BLOCKED BY SENTINEL
        </h2>
        <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
          Our AI Anomaly Classifier flagged this session with an anomalous risk score. The IP address, device headers, and routing profiles have been cataloged for administrative auditing.
        </p>
      </div>

      {/* Audit Stats list */}
      <div
        className="glass-panel"
        style={{
          padding: '16px',
          borderRadius: 'var(--border-radius-md)',
          textAlign: 'left',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(255, 0, 85, 0.02)',
          border: '1px solid rgba(255, 0, 85, 0.12)',
        }}
      >
        <div className="flex-between">
          <span style={{ color: 'hsl(var(--text-muted))' }}>Threat Metric:</span>
          <span style={{ color: 'hsl(var(--accent-red))', fontWeight: 700 }}>CRITICAL (92/100)</span>
        </div>
        <div className="flex-between">
          <span style={{ color: 'hsl(var(--text-muted))' }}>Anomaly triggers:</span>
          <span style={{ color: 'hsl(var(--text-primary))', fontWeight: 500 }}>Geo-IP Mismatch / Bot signature</span>
        </div>
        <div className="flex-between">
          <span style={{ color: 'hsl(var(--text-muted))' }}>Network Status:</span>
          <span style={{ color: 'hsl(var(--text-primary))', fontWeight: 500 }}>Quarantined Host</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-premium"
          style={{ width: '100%' }}
        >
          Return to Authentication
        </button>
      </div>
    </div>
  );
};

export default SuspiciousLogin;
