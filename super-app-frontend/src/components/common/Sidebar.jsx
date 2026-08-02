import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  Home,
  Clapperboard,
  Wallet,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  User,
  Camera,
  Sliders
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState('all');

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('sentinel_active_app');
    window.location.href = '/';
  };

  const getNavConfig = () => {
    switch (activeApp) {
      case 'payment':
        return {
          title: 'APEX PAY',
          titleColor: 'hsl(var(--accent-green))',
          accentColor: 'hsl(var(--accent-green))',
          logoIcon: <Wallet size={20} color="hsl(var(--accent-green))" />,
          logoBg: 'rgba(0, 230, 118, 0.05)',
          logoBorder: '1px solid rgba(0, 230, 118, 0.15)',
          links: [
            { to: '/payment', label: 'Wallet balance', icon: <Wallet size={18} /> },
            { to: '/payment/send', label: 'Transfer funds', icon: <ArrowUpRight size={18} /> },
            { to: '/payment/receive', label: 'Receive funds', icon: <ArrowDownLeft size={18} /> },
            { to: '/payment/banks', label: 'Linked Accounts', icon: <CreditCard size={18} /> },
            { to: '/payment/transactions', label: 'Ledger History', icon: <History size={18} /> },
            { to: '/profile', label: 'Pay Settings', icon: <Sliders size={18} /> }
          ]
        };

      case 'instagram':
        return {
          title: 'INSTAGLANCE',
          titleColor: 'hsl(var(--accent-purple))',
          accentColor: 'hsl(var(--accent-purple))',
          logoIcon: <Clapperboard size={20} color="hsl(var(--accent-purple))" />,
          logoBg: 'rgba(189, 0, 255, 0.05)',
          logoBorder: '1px solid rgba(189, 0, 255, 0.15)',
          links: [
            { to: '/reels', label: 'Reels feed', icon: <Clapperboard size={18} /> },
            { to: '/reels/upload', label: 'Upload draft', icon: <Camera size={18} /> },
            { to: '/messaging', label: 'Direct Chats', icon: <MessageSquare size={18} /> },
            { to: '/profile', label: 'Social Profile', icon: <User size={18} /> }
          ]
        };

      default:
        return {
          title: 'SENTINELAI',
          titleColor: 'hsl(var(--accent-cyan))',
          accentColor: 'hsl(var(--accent-cyan))',
          logoIcon: <Shield size={20} color="hsl(var(--accent-cyan))" />,
          logoBg: 'rgba(0, 240, 255, 0.05)',
          logoBorder: '1px solid rgba(0, 240, 255, 0.15)',
          links: [
            { to: '/', label: 'Home Feed', icon: <Home size={18} /> },
            { to: '/reels', label: 'Short Reels', icon: <Clapperboard size={18} /> },
            { to: '/payment', label: 'Wallet', icon: <Wallet size={18} /> },
            { to: '/messaging', label: 'Live Chats', icon: <MessageSquare size={18} /> }
          ]
        };
    }
  };

  const config = getNavConfig();

  return (
    <div
      className="sidebar glass-panel"
      style={{
        width: 'var(--sidebar-width)',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid hsl(var(--border-color))',
        zIndex: 100,
        background: 'hsl(var(--bg-secondary) / 0.85)'
      }}
    >
      {/* Brand Logo header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid hsl(var(--border-color))',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}
        onClick={() => {
          if (activeApp === 'payment') navigate('/payment');
          else if (activeApp === 'instagram') navigate('/reels');
          else navigate('/');
        }}
      >
        <div style={{ padding: '6px', borderRadius: 'var(--border-radius-sm)', background: config.logoBg, border: config.logoBorder }}>
          {config.logoIcon}
        </div>
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>
          {config.title.split(' ')[0]}
          <span style={{ color: config.accentColor }}>{config.title.split(' ')[1] || 'AI'}</span>
        </span>
      </div>

      {/* Dynamic Nav List */}
      <nav style={{ padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {config.links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
              background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
              borderLeft: isActive ? `3px solid ${config.accentColor}` : '3px solid transparent',
              transition: 'all var(--transition-fast)'
            })}
            className="sidebar-link"
            end={link.to === '/' || link.to === '/payment' || link.to === '/reels'}
          >
            {React.cloneElement(link.icon, { color: 'currentColor' })}
            {link.label}
          </NavLink>
        ))}

        {user && user.role === 'admin' && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              marginTop: '12px',
              color: isActive ? '#fff' : 'hsl(var(--accent-red))',
              background: isActive ? 'linear-gradient(135deg, hsl(var(--accent-red)), #b3003b)' : 'rgba(255, 0, 85, 0.04)',
              border: isActive ? 'none' : '1px solid rgba(255, 0, 85, 0.15)',
              transition: 'all var(--transition-fast)'
            })}
          >
            <LayoutDashboard size={18} />
            Sentinel Portal
          </NavLink>
        )}
      </nav>

      {/* Profile Footer */}
      {user && (
        <div
          style={{
            padding: '20px 16px',
            borderTop: '1px solid hsl(var(--border-color))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${config.accentColor}, hsl(var(--accent-purple)))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                fontSize: '14px',
                boxShadow: `0 0 10px ${config.accentColor}40`
              }}
            >
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(var(--text-muted))',
              display: 'flex',
              padding: '6px',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--accent-red))';
              e.currentTarget.style.background = 'rgba(255, 0, 85, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--text-muted))';
              e.currentTarget.style.background = 'none';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
