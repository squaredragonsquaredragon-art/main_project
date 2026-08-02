import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center', background: '#030712' }}>
      <ShieldAlert size={48} color="hsl(var(--accent-red))" />
      <h1 style={{ fontSize: '36px', fontWeight: 800 }}>404 - NODE UNREADABLE</h1>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: 0, fontSize: '14px' }}>
        The requested address block is quarantined or does not exist on the Sentinel network.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '10px' }}>
        Return to Secure Home
      </button>
    </div>
  );
};

export default NotFound;
