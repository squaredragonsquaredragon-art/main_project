import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wallet, Clapperboard, ArrowRight, Lock, Zap } from 'lucide-react';

const BootSelector = () => {
  const navigate = useNavigate();

  const handleSelectApp = (appType) => {
    localStorage.setItem('sentinel_active_app', appType);
    navigate('/login');
  };

  const apps = [
    {
      type: 'payment',
      name: 'Apex Pay',
      subtitle: 'FINANCIAL WALLET PORTAL',
      desc: 'Secure digital wallet, instant money transfers & decentralized ledger operations console.',
      icon: <Wallet size={28} color="#10b981" />,
      accent: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      badgeText: 'Decentralized Vault',
    },
    {
      type: 'instagram',
      name: 'InstaGlance',
      subtitle: 'SOCIAL MEDIA & REELS PORTAL',
      desc: 'Encrypted social media network. Watch short video reels, post stories & direct chat logs.',
      icon: <Clapperboard size={28} color="#a855f7" />,
      accent: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.12)',
      borderColor: 'rgba(168, 85, 247, 0.25)',
      badgeText: 'Encrypted Stream',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #030712 100%)',
        padding: '32px 20px',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          top: '-10%',
          left: '20%',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          bottom: '-10%',
          right: '20%',
          pointerEvents: 'none'
        }}
      />

      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '36px', zIndex: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            marginBottom: '14px',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)'
          }}
        >
          <Shield size={28} color="#38bdf8" />
        </div>
        <h1 style={{ fontSize: '34px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: '#f8fafc' }}>
          SENTINEL<span style={{ color: '#38bdf8' }}> AI</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px', maxWidth: '440px', lineHeight: 1.6 }}>
          Select secure micro-application gateway node. Isolated database tables and end-to-end encryption apply.
        </p>
      </div>

      {/* App Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 320px))',
          gap: '24px',
          zIndex: 10,
          width: '100%',
          maxWidth: '680px',
          justifyContent: 'center'
        }}
      >
        {apps.map((app) => (
          <div
            key={app.type}
            onClick={() => handleSelectApp(app.type)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              cursor: 'pointer',
              background: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${app.borderColor}`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)`,
              borderRadius: '20px',
              padding: '28px 24px',
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(12px)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = app.accent;
              e.currentTarget.style.boxShadow = `0 16px 40px ${app.bgGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = app.borderColor;
              e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)`;
            }}
          >
            {/* Top row with badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: app.bgGlow,
                  border: `1px solid ${app.borderColor}`
                }}
              >
                {app.icon}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: app.accent,
                  background: app.bgGlow,
                  border: `1px solid ${app.borderColor}`,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                {app.badgeText}
              </span>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: app.accent, letterSpacing: '0.08em' }}>
                {app.subtitle}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {app.name}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '12.5px', lineHeight: 1.55, margin: '2px 0 0' }}>
                {app.desc}
              </p>
            </div>

            {/* Action button */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '13px',
                fontWeight: 700,
                color: app.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Launch Application</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{ marginTop: '36px', textAlign: 'center', zIndex: 10 }}>
        <span style={{ fontSize: '11px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={12} color="#64748b" />
          Protected by Sentinel AI Security Core & Automated Intrusion Protection
        </span>
      </div>
    </div>
  );
};

export default BootSelector;
