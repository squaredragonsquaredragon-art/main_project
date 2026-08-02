import React from 'react';
import { Compass, ShieldAlert } from 'lucide-react';

const Explore = () => {
  return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
      <Compass size={48} color="hsl(var(--accent-cyan))" style={{ display: 'block', margin: '0 auto 16px auto', animation: 'floatAnimation 3s infinite' }} />
      <h2>Sentinel AI Threat Intelligence</h2>
      <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '480px', margin: '8px auto 0 auto', fontSize: '13px', lineHeight: 1.6 }}>
        Explore global threat logs databases, read ML anomaly reports, and monitor decentralized security parameters.
      </p>
    </div>
  );
};

export default Explore;
