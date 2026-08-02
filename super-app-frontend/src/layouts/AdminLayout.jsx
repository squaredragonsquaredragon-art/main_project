import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Cpu, Activity, LogOut, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/admin', label: 'Security Dashboard', icon: <ShieldAlert size={16} /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users size={16} /> },
    { to: '/admin/threats', label: 'AI Threat Logs', icon: <Cpu size={16} /> },
    { to: '/admin/alerts', label: 'Incident Records', icon: <Activity size={16} /> }
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #0c1220 0%, #030712 100%)',
        color: 'hsl(var(--text-primary))',
        fontFamily: 'var(--font-primary)',
      }}
    >
      {/* Admin Left Drawer (Dual-Pane Sentinel Console) */}
      <div
        className="glass-panel"
        style={{
          width: '260px',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid hsla(var(--accent-red), 0.15)',
          zIndex: 100,
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 30px rgba(255, 0, 85, 0.05)',
        }}
      >
        {/* Header Console title */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'rgba(255, 0, 85, 0.05)',
              border: '1px solid rgba(255, 0, 85, 0.25)',
              boxShadow: 'var(--neon-glow-red)',
              display: 'flex',
            }}
          >
            <ShieldAlert size={20} color="hsl(var(--accent-red))" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.05em' }}>SENTINEL<span style={{ color: 'hsl(var(--accent-red))' }}>AI</span></span>
            <span style={{ fontSize: '10px', color: 'hsl(var(--accent-red))', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Secure Portal</span>
          </div>
        </div>

        {/* Console Nav Links */}
        <nav style={{ padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 600,
                fontSize: '13px',
                color: isActive ? '#fff' : 'hsl(var(--text-secondary))',
                background: isActive ? 'linear-gradient(135deg, hsl(var(--accent-red)), #b3003b)' : 'transparent',
                borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? '0 4px 12px rgba(255, 0, 85, 0.2)' : 'none',
              })}
              end={item.to === '/admin'}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to App Link */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'hsl(var(--text-secondary))',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--text-secondary))';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <ArrowLeft size={14} />
            Exit Admin Console
          </button>
        </div>

        {/* Console User Profile details */}
        {user && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, hsl(var(--accent-red)), hsl(var(--accent-purple)))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#fff',
                }}
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{user.username}</span>
                <span style={{ fontSize: '10px', color: 'hsl(var(--accent-red))', fontWeight: 700 }}>Sentinel</span>
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
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--accent-red))'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-muted))'}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Admin Panel Workspace */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          className="glass-panel"
          style={{
            height: '70px',
            borderBottom: '1px solid rgba(255, 0, 85, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: 'rgba(10, 15, 30, 0.8)',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--accent-red))', margin: 0 }}>
            Sentinel Threat Console v1.0.0
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'inherit',
                display: 'flex',
              }}
            >
              {theme === 'dark' ? <Sun size={18} color="hsl(var(--accent-cyan))" /> : <Moon size={18} color="hsl(var(--text-secondary))" />}
            </button>
          </div>
        </header>

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }} className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
