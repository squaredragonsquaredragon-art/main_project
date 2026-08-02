import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const ServerError = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center', background: '#030712' }}>
      <ShieldAlert size={48} color="hsl(var(--accent-red))" />
      <h1 style={{ fontSize: '36px', fontWeight: 800 }}>500 - DATABASE CONSENSUS FAIL</h1>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: 0, fontSize: '14px' }}>
        Sentinel firewall detected database quarantine or active network integrity anomalies.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: '10px' }}>
        Retry node link
      </button>
    </div>
  );
};

export default ServerError;
