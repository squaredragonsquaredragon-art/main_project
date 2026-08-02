import React from 'react';
import { Link } from 'react-router-dom';
import { MdShield } from 'react-icons/md';

const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--clr-bg-primary)',
    textAlign: 'center',
    padding: '24px',
  }}>
    <div style={{
      fontSize: '8rem', fontWeight: 900, lineHeight: 1,
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: '16px',
    }}>
      404
    </div>
    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: '12px' }}>
      Page Not Found
    </h1>
    <p style={{ color: 'var(--clr-text-muted)', marginBottom: '32px', maxWidth: '400px' }}>
      The page you're looking for doesn't exist or has been moved to a different location.
    </p>
    <Link to="/dashboard">
      <button className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MdShield /> Back to Dashboard
      </button>
    </Link>
  </div>
);

export default NotFound;
