import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePaymentStore } from '../../store/paymentStore';
import { useSecurityStore } from '../../store/securityStore';
import {
  User,
  ShieldCheck,
  Mail,
  ArrowRight,
  CreditCard,
  History,
  Grid,
  Heart,
  MessageCircle,
  Sliders,
  Settings,
  Award
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const UserProfile = () => {
  const { user } = useAuthStore();
  const { balance, banks, fetchWalletState } = usePaymentStore();
  const { fetchLoginHistory } = useSecurityStore();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
    
    // Prefetch relevant stores
    if (app === 'payment') {
      fetchWalletState();
    }
    fetchLoginHistory(1, 4);
  }, [fetchWalletState, fetchLoginHistory]);

  const getAccentColor = () => {
    if (activeApp === 'payment') return 'hsl(var(--accent-green))';
    if (activeApp === 'instagram') return 'hsl(var(--accent-purple))';
    return 'hsl(var(--accent-cyan))';
  };

  // ──── MOCK PROFILE SPECIFICS ──────────────────────────────────
  
  // Instagram Mock Posts
  const mockSocialPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      likes: 120,
      comments: 14
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      likes: 85,
      comments: 6
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      likes: 242,
      comments: 31
    }
  ];

  // E-commerce Mock Orders
  const mockOrders = [
    { id: 'ORD_99482', date: '2026-05-24T12:00:00Z', items: 'Sentinel AI Key Token (x1)', total: 120.00, status: 'dispatched' },
    { id: 'ORD_99420', date: '2026-05-22T08:30:00Z', items: 'Quantum smart core watch (x1)', total: 450.00, status: 'delivered' }
  ];

  // ──── RENDERING SUB-PROFILES ──────────────────────────────────
  
  // 1. Apex Pay Settings Profile (Fintech layout)
  const renderPaymentProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Fintech Card details */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `4px solid ${getAccentColor()}`,
          boxShadow: '0 8px 30px rgba(0, 230, 118, 0.05)',
          padding: '32px'
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--accent-green)), hsl(var(--accent-blue)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '20px',
              color: '#000',
              boxShadow: 'var(--neon-glow-cyan)'
            }}
          >
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 800 }}>{user?.username}</h2>
              <span className="badge badge-success" style={{ fontSize: '8px', padding: '2px 6px' }}>Fintech Verified</span>
            </div>
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{user?.email}</span>
          </div>
        </div>
        <button onClick={() => navigate('/profile/edit')} className="btn btn-secondary" style={{ fontSize: '13px', padding: '10px 16px' }}>
          Edit Profile
        </button>
      </div>

      {/* Quick stats grids */}
      <div className="grid-cols-2">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Apex ledger capital</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: getAccentColor() }}>{formatCurrency(balance)}</span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Consensus validation</span>
          <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="hsl(var(--accent-green))" /> Node synchronized
          </span>
        </div>
      </div>

      {/* Banking links list */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color={getAccentColor()} />
          Settlement bank account nodes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {banks.map((bank) => (
            <div
              key={bank.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{bank.logo}</span>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{bank.name}</span>
              </div>
              <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>{bank.accountNo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. InstaGlance User Social Profile (Instagram replica view)
  const renderSocialProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Instagram Header section */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '32px' }}>
        {/* User circular avatar */}
        <div
          style={{
            width: '86px',
            height: '86px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glass-shadow)'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '28px',
              color: '#fff'
            }}
          >
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Bio descriptors & stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{user?.username}</h2>
            <button
              onClick={() => navigate('/profile/edit')}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '4px', height: '32px', background: 'rgba(255,255,255,0.08)' }}
            >
              Edit Profile
            </button>
            <Settings size={18} style={{ cursor: 'pointer', color: 'hsl(var(--text-secondary))' }} onClick={() => navigate('/profile/settings')} />
          </div>

          {/* Social post/followers counter stats */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <span><strong>3</strong> posts</span>
            <span><strong>1.2K</strong> followers</span>
            <span><strong>340</strong> following</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
            <span style={{ fontWeight: 700 }}>{user?.first_name || 'Neo'} {user?.last_name || 'Prime'}</span>
            <span style={{ color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
              🛡️ AI Cyber-security node researcher.
              🧬 Sandbox InstaGlance social node initialized.
            </span>
          </div>
        </div>
      </div>

      {/* Instagram mock visual grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: getAccentColor() }}>
            <Grid size={14} /> POSTS
          </span>
        </div>

        {/* 3 columns grid */}
        <div className="grid-cols-3" style={{ gap: '16px' }}>
          {mockSocialPosts.map((post) => (
            <div
              key={post.id}
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.04)'
              }}
              className="social-post-hover"
            >
              <img src={post.image} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Overlay likes stats on hover */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  opacity: 0,
                  transition: 'opacity var(--transition-fast)',
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#fff' }}>
                  <Heart size={16} fill="#fff" /> {post.likes}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#fff' }}>
                  <MessageCircle size={16} fill="#fff" /> {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



  // Fallback Unified Settings View
  const renderFallbackProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <User size={40} color="hsl(var(--accent-cyan))" style={{ display: 'block', margin: '0 auto 12px auto' }} />
        <h2>{user?.username}</h2>
        <p>{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {activeApp === 'payment' && renderPaymentProfile()}
      {activeApp === 'instagram' && renderSocialProfile()}
      {activeApp === 'all' && renderFallbackProfile()}

      {/* Universal settings links under profile */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Node security controls
        </h3>
        
        {[
          { to: '/profile/security', label: 'Security & Access Keys', desc: 'Change security passwords, audit certificates' },
          { to: '/profile/privacy', label: 'Privacy & Quarantine Settings', desc: 'Modify anonymous blocks, firewall details' },
          { to: '/profile/settings', label: 'Terminal Configurations', desc: 'Aesthetic styles overrides, sounds' }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.to)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = `hsla(var(--accent-cyan), 0.2)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{item.desc}</span>
            </div>
            <ArrowRight size={14} color="hsl(var(--text-muted))" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
