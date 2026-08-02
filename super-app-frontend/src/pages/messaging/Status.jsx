import React from 'react';
import { Compass } from 'lucide-react';

const Status = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
      <Compass size={48} color="hsl(var(--accent-cyan))" style={{ display: 'block', margin: '0 auto 16px auto' }} />
      <h2>Live Status Stories</h2>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '8px auto 0 auto', fontSize: '13px' }}>
        Observe real-time operations updates, network bulletins, and biometric credentials logs.
      </p>
    </div>
  );
};

export default Status;
