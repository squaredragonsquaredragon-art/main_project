import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-wrapper">
    <div className="spinner" />
    <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>{text}</span>
  </div>
);

export const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--clr-bg-primary)',
    gap: '20px'
  }}>
    <div style={{
      width: '60px', height: '60px',
      border: '3px solid rgba(59,130,246,0.15)',
      borderTopColor: 'var(--clr-accent-blue)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
      Loading SentinelAI...
    </p>
  </div>
);

export default Loader;
