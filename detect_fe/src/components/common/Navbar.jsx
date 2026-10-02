import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdMenu, MdNotifications, MdSearch, MdRefresh, MdVolumeUp, MdVolumeOff } from 'react-icons/md';
import { FiActivity } from 'react-icons/fi';
import { hackerAlarm } from '../../utils/hackerAlarmSound';
import toast from 'react-hot-toast';

const Navbar = ({ collapsed, onMenuClick }) => {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('sentinel_hacker_alarm_muted') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsMuted(localStorage.getItem('sentinel_hacker_alarm_muted') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sentinel_audio_mute_change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sentinel_audio_mute_change', handleStorageChange);
    };
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('sentinel_hacker_alarm_muted', String(next));
    window.dispatchEvent(new Event('sentinel_audio_mute_change'));
    if (next) {
      hackerAlarm.stop();
      toast('🔇 Hacker alarm sound MUTED', { icon: '🔇' });
    } else {
      toast.success('🔊 Hacker alarm sound UNMUTED');
      hackerAlarm.playTestOnce();
    }
  };

  return (
    <header className={`navbar ${collapsed ? 'collapsed' : ''}`}>
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="notification-btn"
          style={{ display: 'flex' }}
          aria-label="Toggle menu"
        >
          <MdMenu />
        </button>

        <div className="live-indicator">
          <span className="live-dot" />
          LIVE
        </div>
      </div>

      {/* Center - Search (desktop) */}
      <div className="search-bar" style={{ display: showSearch || window.innerWidth > 768 ? 'flex' : 'none' }}>
        <span className="search-icon"><MdSearch /></span>
        <input
          type="text"
          placeholder="Search users, alerts, IPs..."
          id="global-search"
          onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
        />
      </div>

      {/* Right side */}
      <div className="navbar-right">
        <button
          className="notification-btn"
          onClick={() => setShowSearch(!showSearch)}
          style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
          aria-label="Search"
        >
          <MdSearch />
        </button>

        <button
          className="notification-btn"
          onClick={toggleMute}
          title={isMuted ? "Hacker Alarm Audio: MUTED (Click to Unmute)" : "Hacker Alarm Audio: ACTIVE (Click to Mute)"}
          aria-label="Toggle Sound"
          style={{
            color: isMuted ? 'var(--clr-text-muted)' : 'var(--clr-accent-cyan)',
            position: 'relative'
          }}
        >
          {isMuted ? <MdVolumeOff style={{ fontSize: '1.25rem' }} /> : <MdVolumeUp style={{ fontSize: '1.25rem' }} />}
          {!isMuted && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }}
            />
          )}
        </button>

        <Link to="/alerts" className="notification-btn" aria-label="Alerts" title="View Alerts">
          <MdNotifications />
          <span className="notification-dot" />
        </Link>

        <Link
          to="/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--clr-border)',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          aria-label="Profile"
        >
          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
            {(user?.username || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', fontWeight: 500 }}>
            {user?.username || user?.email?.split('@')[0] || 'User'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
