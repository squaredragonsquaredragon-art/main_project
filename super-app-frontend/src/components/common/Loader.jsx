import React from 'react';
import { Shield } from 'lucide-react';

const Loader = ({ size = 'medium', message = 'Processing authentication metadata...' }) => {
  const getSpinnerSize = () => {
    if (size === 'small') return '32px';
    if (size === 'large') return '80px';
    return '56px';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        width: '100%',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          width: getSpinnerSize(),
          height: getSpinnerSize(),
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.03)',
          borderTop: '3px solid hsl(var(--accent-cyan))',
          animation: 'spinSlow 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--neon-glow-cyan)',
        }}
      >
        <Shield size={size === 'large' ? 28 : size === 'small' ? 12 : 18} color="hsl(var(--accent-cyan))" style={{ animation: 'pulseGlowCyan 2s infinite' }} />
      </div>
      {message && (
        <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 500, letterSpacing: '0.02em', textAlign: 'center' }}>
          {message}
        </span>
      )}
    </div>
  );
};

export default Loader;
