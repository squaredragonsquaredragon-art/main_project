import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center', background: '#030712' }}>
      <ShieldAlert size={48} color="hsl(var(--accent-orange))" />
      <h1 style={{ fontSize: '36px', fontWeight: 800 }}>401 - CLEARENCE LEVEL INSUFFICIENT</h1>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: 0, fontSize: '14px' }}>
        Your user node is missing required security clearances to inspect these logs.
      </p>
      <button onClick={() => navigate('/')} className="btn btn-premium" style={{ marginTop: '10px' }}>
        Return to Secure Home
      </button>
    </div>
  );
};

export default Unauthorized;
