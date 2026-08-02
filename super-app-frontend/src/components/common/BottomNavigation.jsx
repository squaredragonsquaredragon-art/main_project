import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  CreditCard,
  User,
  Clapperboard,
  Camera,
  MessageSquare,
  Home
} from 'lucide-react';

const BottomNavigation = () => {
  const [activeApp, setActiveApp] = useState('all');

  useEffect(() => {
    const app = localStorage.getItem('sentinel_active_app') || 'all';
    setActiveApp(app);
  }, []);

  const getTabsConfig = () => {
    switch (activeApp) {
      case 'payment':
        return [
          { to: '/payment', icon: <Wallet size={20} />, label: 'Wallet' },
          { to: '/payment/send', icon: <ArrowUpRight size={20} />, label: 'Send' },
          { to: '/payment/banks', icon: <CreditCard size={20} />, label: 'Banks' },
          { to: '/profile', icon: <User size={20} />, label: 'Profile' }
        ];

      case 'instagram':
        return [
          { to: '/reels', icon: <Clapperboard size={20} />, label: 'Reels' },
          { to: '/reels/upload', icon: <Camera size={20} />, label: 'Upload' },
          { to: '/messaging', icon: <MessageSquare size={20} />, label: 'Chats' },
          { to: '/profile', icon: <User size={20} />, label: 'Profile' }
        ];

      default:
        return [
          { to: '/', icon: <Home size={20} />, label: 'Home' },
          { to: '/reels', icon: <Clapperboard size={20} />, label: 'Reels' },
          { to: '/payment', icon: <Wallet size={20} />, label: 'Wallet' },
          { to: '/messaging', icon: <MessageSquare size={20} />, label: 'Chats' }
        ];
    }
  };

  const tabs = getTabsConfig();

  return (
    <div
      className="bottom-navigation glass-panel"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-height)',
        borderTop: '1px solid hsl(var(--border-color))',
        background: 'hsl(var(--bg-secondary) / 0.95)',
        zIndex: 100,
        display: 'none', /* overridden in media query mobile.css */
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'var(--glass-blur)'
      }}
    >
      {tabs.map((tab, idx) => (
        <NavLink
          key={idx}
          to={tab.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive ? 'hsl(var(--accent-cyan))' : 'hsl(var(--text-muted))',
            fontSize: '10px',
            fontWeight: 600,
            padding: '8px 12px',
            transition: 'color var(--transition-fast)',
          })}
          end={tab.to === '/' || tab.to === '/payment' || tab.to === '/reels'}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNavigation;
