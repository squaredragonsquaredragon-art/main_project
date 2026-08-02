import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
// CSS is imported globally in App.jsx — no need to re-import here

const AuthLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        /* Static multi-stop radial gradient replaces animated blur orbs — zero GPU cost */
        background: `
          radial-gradient(ellipse at 15% 20%, rgba(0, 240, 255, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 45%),
          radial-gradient(circle at center, #111827 0%, #030712 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '24px 26px',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
