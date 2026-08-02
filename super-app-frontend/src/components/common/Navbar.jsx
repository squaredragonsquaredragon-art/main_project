import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useSecurityStore } from '../../store/securityStore';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { unreadAlertCount, fetchUnreadAlertCount } = useSecurityStore();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUnreadAlertCount();
    // Poll unread alert count every 30 seconds
    const interval = setInterval(fetchUnreadAlertCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadAlertCount]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home Feed';
    if (path.startsWith('/reels')) return 'Interactive Reels';
    if (path.startsWith('/payment')) return 'Secure Wallet';
    if (path.startsWith('/messaging')) return 'Real-time Chat';
    if (path.startsWith('/profile')) return 'Account Configuration';
    if (path.startsWith('/notifications')) return 'Security Bulletins';
    return 'SentinelAI App';
  };

  return (
    <header
      className="glass-panel"
      style={{
        height: 'var(--navbar-height)',
        borderBottom: '1px solid hsl(var(--border-color))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'hsl(var(--bg-primary) / 0.8)',
        backdropFilter: 'var(--glass-blur)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-only"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'inherit',
            display: 'flex',
          }}
        >
          <Menu size={20} />
        </button>
        
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
          {getPageTitle()}
        </h2>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            color: 'inherit',
            display: 'flex',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {theme === 'dark' ? <Sun size={18} color="hsl(var(--accent-cyan))" /> : <Moon size={18} color="hsl(var(--text-secondary))" />}
        </button>

        {/* Notifications Trigger */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            color: 'inherit',
            display: 'flex',
            position: 'relative',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <Bell size={18} />
          {unreadAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'hsl(var(--accent-red))',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                boxShadow: 'var(--neon-glow-red)',
              }}
            />
          )}
        </button>

        {/* Mobile logout option */}
        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="mobile-only"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            color: 'hsl(var(--text-muted))',
            display: 'flex',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
