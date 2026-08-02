import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdHistory, MdNotifications, MdBarChart,
  MdPerson, MdSupervisorAccount, MdShield, MdLogout,
  MdChevronLeft, MdChevronRight
} from 'react-icons/md';
import { ROLES } from '../../utils/constants';
import { alertService } from '../../services/alertService';

const Sidebar = ({ collapsed, onToggle, mobileOpen }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const isSuperAdmin = user?.username === 'qwer1234' || user?.is_superuser === true;
  const isAdmin = user?.role === ROLES.ADMIN || user?.is_staff;

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const data = await alertService.getUnreadCount();
        setUnreadCount(data.unread_count || 0);
      } catch (err) {
        console.error('Failed to fetch unread badge count:', err);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    {
      section: 'Overview',
      links: [
        { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
        { to: '/login-history', icon: <MdHistory />, label: 'Login History' },
        { to: '/alerts', icon: <MdNotifications />, label: 'Alerts', badge: unreadCount > 0 ? String(unreadCount) : undefined },
      ]
    },
    {
      section: 'Analytics',
      links: [
        { to: '/reports', icon: <MdBarChart />, label: 'Reports & Analytics' },
      ]
    },
    {
      section: 'Account',
      links: [
        { to: '/profile', icon: <MdPerson />, label: 'Profile' },
      ]
    },
  ];

  const adminItems = {
    section: 'Administration',
    links: [
      { to: '/admin', icon: <MdSupervisorAccount />, label: 'Super Admin Panel' },
    ]
  };

  const allItems = isSuperAdmin ? [...navItems, adminItems] : navItems;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 99
          }}
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <MdShield style={{ color: 'white', fontSize: '20px' }} />
          </div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">TheftGuard AI</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', marginTop: '1px', fontWeight: 600 }}>
                Theft & Fraud Monitor
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            style={{
              marginLeft: 'auto', width: '28px', height: '28px',
              borderRadius: '6px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--clr-border)',
              color: 'var(--clr-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0
            }}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {allItems.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <div className="nav-section-label">{section.section}</div>
              )}
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  title={collapsed ? link.label : undefined}
                >
                  <span className="nav-icon">{link.icon}</span>
                  {!collapsed && (
                    <>
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="nav-badge">{link.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--clr-border)',
              marginBottom: '8px'
            }}>
              <div className="user-avatar">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)', truncate: 'ellipsis' }}>
                  {user?.username || user?.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
                  {isAdmin ? 'Administrator' : 'User'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div className="user-avatar">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-secondary)', justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="nav-icon" style={{ color: 'var(--clr-accent-red)' }}><MdLogout /></span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
