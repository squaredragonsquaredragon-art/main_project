import React, { useState, useEffect, useCallback } from 'react';
import {
  MdHistory, MdSearch, MdFilterList, MdLocationOn, MdDevices,
  MdAccessTime, MdPayment, MdCameraAlt, MdShoppingCart, MdLanguage,
  MdRefresh, MdPerson, MdLogin, MdPersonAdd, MdBlock, MdTouchApp,
  MdSecurity, MdDelete, MdCheckCircle
} from 'react-icons/md';
import { FiActivity, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { dashboardService } from '../services/dashboardService';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const riskColors = {
  low: 'badge-normal',
  medium: 'badge-warning',
  high: 'badge-suspicious',
  critical: 'badge-suspicious',
};

const ITEMS_PER_PAGE = 12;

// Module tabs
const APP_TABS = [
  { id: 'all', label: 'All Apps', icon: <MdLanguage />, color: 'var(--clr-accent-blue)' },
  { id: 'payment', label: 'Apex Pay', icon: <MdPayment />, color: 'var(--clr-accent-green)' },
  { id: 'instagram', label: 'InstaGlance', icon: <MdCameraAlt />, color: 'var(--clr-accent-purple)' },
];

// Event type sub-filters
const EVENT_FILTERS = [
  { id: 'all', label: 'All Events', icon: <MdLanguage />, cls: 'badge-info' },
  { id: 'register', label: 'Register', icon: <MdPersonAdd />, cls: 'badge-normal' },
  { id: 'login', label: 'Login', icon: <MdLogin />, cls: 'badge-info' },
  { id: 'failed', label: 'Failed / Hack', icon: <FiAlertTriangle />, cls: 'badge-suspicious' },
  { id: 'activity', label: 'App Activity', icon: <MdTouchApp />, cls: 'badge-warning' },
];

// App meta for display
const APP_META = {
  payment: { color: 'var(--clr-accent-green)', icon: <MdPayment />, label: 'Apex Pay' },
  instagram: { color: 'var(--clr-accent-purple)', icon: <MdCameraAlt />, label: 'InstaGlance' },
  system: { color: 'var(--clr-accent-blue)', icon: <MdSecurity />, label: 'System' },
  unknown: { color: 'var(--clr-text-muted)', icon: <MdLanguage />, label: 'Unknown' },
};

// Event type badge
const EVENT_META = {
  register: { label: 'Register', color: 'var(--clr-accent-green)', icon: <MdPersonAdd /> },
  login: { label: 'Login', color: 'var(--clr-accent-blue)', icon: <MdLogin /> },
  failed: { label: 'Failed', color: 'var(--clr-accent-red)', icon: <MdBlock /> },
  activity: { label: 'Activity', color: 'var(--clr-accent-amber)', icon: <MdTouchApp /> },
};

const LoginHistory = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [logins, setLogins] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({ total_logins: 0, suspicious_attempts: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [unblockingId, setUnblockingId] = useState(null);

  const fetchBlocked = useCallback(async () => {
    try {
      const data = await adminService.getUsers();
      const blocked = data.filter((u) => !u.is_active);
      setBlockedUsers(blocked);
    } catch (err) {
      console.error('Failed to fetch blocked users:', err);
    }
  }, []);

  const handleUnblockUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to unblock account '${username}'?`)) return;
    setUnblockingId(userId);
    try {
      await adminService.updateUser(userId, { is_active: true });
      toast.success(`Account '${username}' has been successfully unblocked!`);
      // Update local states optimistically
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      // Re-fetch everything
      fetchBlocked();
      fetchData(true);
    } catch (err) {
      console.error('Failed to unblock user:', err);
      toast.error('Failed to unblock account. Please try again.');
    } finally {
      setUnblockingId(null);
    }
  };

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [histData, statsData] = await Promise.all([
        dashboardService.getHistory(page, ITEMS_PER_PAGE, appFilter, eventFilter).catch(() => null),
        dashboardService.getStats().catch(() => null),
      ]);
      if (histData) {
        setLogins(histData.items || []);
        setTotalItems(histData.total || 0);
      }
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch login history:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, appFilter, eventFilter]);

  useEffect(() => {
    fetchData(false);
    fetchBlocked();
    const interval = setInterval(() => {
      fetchData(true);
      fetchBlocked();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchData, fetchBlocked]);

  // Client-side search + status filter
  const filtered = logins.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (l.ip_address && l.ip_address.includes(q)) ||
      (l.username && l.username.toLowerCase().includes(q)) ||
      (l.browser && l.browser.toLowerCase().includes(q)) ||
      (l.location && l.location.toLowerCase().includes(q)) ||
      (l.source_app && l.source_app.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleTabChange = (id) => { setAppFilter(id); setPage(1); setSelectedIds([]); };
  const handleEventChange = (id) => { setEventFilter(id); setPage(1); setSelectedIds([]); };
  const handleStatusChange = (s) => { setStatusFilter(s); setPage(1); setSelectedIds([]); };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filtered.map((row) => row.id);
    const allSelectedOnPage = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the selected ${selectedIds.length} log(s)?`)) return;

    setDeleting(true);
    try {
      await dashboardService.deleteLogs({ log_ids: selectedIds });
      setSelectedIds([]);
      fetchData(false);
    } catch (err) {
      console.error("Failed to delete selected logs:", err);
      alert("Error deleting logs. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllFiltered = async () => {
    const appLabel = APP_TABS.find((t) => t.id === appFilter)?.label || "All";
    const eventLabel = EVENT_FILTERS.find((e) => e.id === eventFilter)?.label || "All";
    const confirmMsg = `WARNING: Are you sure you want to delete ALL logs matching context:
App: ${appLabel}
Event: ${eventLabel}

This action is irreversible and will delete all matching database records!`;

    if (!window.confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      await dashboardService.deleteLogs({
        source_app: appFilter === "all" ? null : appFilter,
        event_type: eventFilter === "all" ? null : eventFilter,
      });
      setSelectedIds([]);
      setPage(1);
      fetchData(false);
    } catch (err) {
      console.error("Failed to delete filtered logs:", err);
      alert("Error deleting logs. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const activeTab = APP_TABS.find(t => t.id === appFilter) || APP_TABS[0];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="page-title icon" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--clr-accent-blue)' }}>
              <MdHistory />
            </span>
            Portal Activity History
          </h1>
          <p className="page-subtitle">
            Live security feed — all users across all 3 application modules &nbsp;
            <span style={{ color: 'var(--clr-accent-cyan)', fontWeight: 600 }}>
              {totalItems} total events
            </span>
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <MdRefresh /> Live Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Events', value: stats?.total_logins || 0, color: 'var(--clr-accent-blue)', bg: 'rgba(59,130,246,0.1)', icon: <MdHistory /> },
          { label: 'Normal Operations', value: Math.max(0, (stats?.total_logins || 0) - (stats?.suspicious_attempts || 0)), color: 'var(--clr-accent-green)', bg: 'rgba(16,185,129,0.1)', icon: <FiActivity /> },
          { label: 'Security Threats', value: stats?.suspicious_attempts || 0, color: 'var(--clr-accent-red)', bg: 'rgba(239,68,68,0.1)', icon: <FiShield /> },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Blocked Accounts Widget */}
      {blockedUsers.length > 0 ? (
        <div className="glass-card" style={{
          padding: '20px 24px',
          background: 'rgba(245, 158, 11, 0.02)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.03)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          animation: 'slideDown 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)', color: 'var(--clr-accent-amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
              }}>
                <MdBlock />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
                  Active Lockouts & Blocked Accounts ({blockedUsers.length})
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                  Accounts currently deactivated due to brute force or manual restriction
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {blockedUsers.map((bu) => (
              <div key={bu.id} style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div className="user-avatar" style={{
                    width: '36px', height: '36px', fontSize: '0.85rem', flexShrink: 0,
                    background: 'rgba(245, 158, 11, 0.15)', color: 'var(--clr-accent-amber)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {(bu.username ? bu.username[0] : 'U').toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--clr-text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {bu.username || 'User'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {bu.email || ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span className={`badge ${riskColors[bu.risk_level] || 'badge-normal'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        {(bu.risk_level || 'low').toUpperCase()} RISK
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
                        {bu.total_logins} logins
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUnblockUser(bu.id, bu.username)}
                  disabled={unblockingId === bu.id}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--clr-accent-green)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <MdCheckCircle />
                  {unblockingId === bu.id ? 'Unlocking...' : 'Unblock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{
          padding: '12px 20px',
          background: 'rgba(16, 185, 129, 0.01)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-accent-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
          }}>
            <MdCheckCircle />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', fontWeight: 600 }}>
            All accounts are currently in good standing. No active brute-force locks or security deactivations recorded.
          </span>
        </div>
      )}

      {/* Module Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '0', borderBottom: '1px solid var(--clr-border)' }}>
        {APP_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px',
              border: 'none', background: appFilter === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderBottom: appFilter === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
              color: appFilter === tab.id ? 'var(--clr-text-primary)' : 'var(--clr-text-secondary)',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', borderRadius: '6px 6px 0 0',
              transition: 'all 0.2s ease', marginBottom: '-1px',
            }}
          >
            <span style={{ fontSize: '1.1rem', color: appFilter === tab.id ? tab.color : 'inherit' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event Type Sub-Filter Row */}
      <div style={{
        display: 'flex', gap: '8px', alignItems: 'center',
        padding: '14px 0', borderBottom: '1px solid var(--clr-border)',
        marginBottom: '18px'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
          Event:
        </span>
        {EVENT_FILTERS.map((ef) => (
          <button
            key={ef.id}
            id={`event-filter-${ef.id}`}
            onClick={() => handleEventChange(ef.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 14px', borderRadius: '20px',
              border: eventFilter === ef.id ? `1px solid ${ef.id === 'failed' ? 'var(--clr-accent-red)' : ef.id === 'register' ? 'var(--clr-accent-green)' : ef.id === 'login' ? 'var(--clr-accent-blue)' : ef.id === 'activity' ? 'var(--clr-accent-amber)' : 'var(--clr-border-hover)'}` : '1px solid var(--clr-border)',
              background: eventFilter === ef.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: eventFilter === ef.id ? 'var(--clr-text-primary)' : 'var(--clr-text-muted)',
              fontFamily: 'inherit', fontWeight: eventFilter === ef.id ? 700 : 500,
              fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{ef.icon}</span>
            {ef.label}
          </button>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        {/* Search + Status */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <div className="search-bar" style={{ maxWidth: '360px' }}>
            <span className="search-icon"><MdSearch /></span>
            <input
              type="text"
              id="login-history-search"
              placeholder="Search by username, IP, action, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MdFilterList style={{ color: 'var(--clr-text-muted)', fontSize: '1.1rem' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Status:</span>
            {['all', 'normal', 'suspicious', 'blocked'].map((s) => (
              <button
                key={s}
                id={`filter-${s}-btn`}
                onClick={() => handleStatusChange(s)}
                className={`badge ${s === 'all' ? 'badge-info' : s === 'normal' ? 'badge-normal' : s === 'suspicious' ? 'badge-suspicious' : 'badge-warning'}`}
                style={{
                  cursor: 'pointer', border: 'none',
                  opacity: statusFilter === s ? 1 : 0.4,
                  transform: statusFilter === s ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {(s || '').charAt(0).toUpperCase() + (s || '').slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action & Deletion Operations Panel */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
          background: 'rgba(239, 68, 68, 0.02)',
          border: '1px solid rgba(239, 68, 68, 0.12)',
          padding: '12px 20px', borderRadius: '8px',
          marginBottom: '20px', gap: '12px'
        }}>
          {/* Left section: selection count and clear selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', fontWeight: 600 }}>
              {selectedIds.length > 0 ? (
                <span style={{ color: 'var(--clr-accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge-dot" style={{ background: 'var(--clr-accent-red)' }} />
                  {selectedIds.length} log(s) selected
                </span>
              ) : (
                <span>No logs selected (use checkboxes in the table below to select particular entries)</span>
              )}
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--clr-border)',
                  color: 'var(--clr-text-primary)', fontSize: '0.75rem', padding: '4px 10px',
                  borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Right section: delete options */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Delete Selected (only active if checkboxes selected) */}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || deleting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.8rem', padding: '6px 14px',
                background: selectedIds.length > 0 ? 'linear-gradient(135deg, var(--clr-accent-red), #b3003b)' : 'rgba(255,255,255,0.02)',
                color: selectedIds.length > 0 ? '#fff' : 'var(--clr-text-muted)',
                cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                border: 'none', borderRadius: '6px',
                boxShadow: selectedIds.length > 0 ? '0 0 12px rgba(239,68,68,0.2)' : 'none',
                opacity: selectedIds.length > 0 ? 1 : 0.5,
                transition: 'all 0.2s ease',
                fontFamily: 'inherit', fontWeight: 600
              }}
            >
              <MdDelete style={{ fontSize: '1rem' }} />
              {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>

            {/* Delete All Filtered */}
            <button
              onClick={handleDeleteAllFiltered}
              disabled={deleting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.8rem', padding: '6px 14px',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--clr-accent-red)',
                background: 'rgba(239,68,68,0.04)',
                cursor: 'pointer', borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit', fontWeight: 600
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; }}
            >
              <MdDelete style={{ fontSize: '1rem' }} />
              Delete All Filtered Logs
            </button>
          </div>
        </div>

        {/* Table Header label */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: activeTab.color, fontSize: '1rem' }}>{activeTab.icon}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
            {activeTab.label}
          </span>
          {eventFilter !== 'all' && (
            <>
              <span style={{ color: 'var(--clr-text-muted)' }}>›</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-secondary)' }}>
                {EVENT_FILTERS.find(e => e.id === eventFilter)?.label}
              </span>
            </>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
            {totalItems} matching events
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every(row => selectedIds.includes(row.id))}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: 'var(--clr-accent-blue)' }}
                  />
                </th>
                <th><MdAccessTime style={{ verticalAlign: 'middle', marginRight: '4px' }} />Time</th>
                <th><MdPerson style={{ verticalAlign: 'middle', marginRight: '4px' }} />User</th>
                <th>IP Address</th>
                <th><MdDevices style={{ verticalAlign: 'middle', marginRight: '4px' }} />App / Event</th>
                <th>Details / Memo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--clr-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <MdRefresh style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
                      Loading live activity logs...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '56px', color: 'var(--clr-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <MdHistory style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                      <span>No activity logs recorded yet for this selection.</span>
                      <span style={{ fontSize: '0.75rem' }}>
                        Try registering or logging in via super-app at localhost:3001
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((row) => {
                const appKey = row.source_app || 'system';
                const meta = APP_META[appKey] || APP_META.system;
                const evMeta = EVENT_META[row.event_type] || EVENT_META.activity;
                const displayUser = row.username || row.user_id?.substring(0, 8) + '…';

                return (
                  <tr key={row.id} style={{
                    background: row.event_type === 'failed' ? 'rgba(239,68,68,0.02)' : undefined,
                    borderLeft: row.event_type === 'failed' ? '3px solid rgba(239,68,68,0.3)' : '3px solid transparent',
                  }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--clr-accent-blue)' }}
                      />
                    </td>
                    <td style={{ color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {formatDateTime(row.login_time)}
                    </td>

                    {/* Username */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(() => {
                          const displayUser = row.username || (row.user_id ? row.user_id.substring(0, 8) + '…' : 'User');
                          return (
                            <>
                              <div style={{
                                width: '26px', height: '26px', borderRadius: '50%',
                                background: `${meta.color}20`, color: meta.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                              }}>
                                {(displayUser || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--clr-text-primary)' }}>
                                {displayUser}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* IP */}
                    <td>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: 'var(--clr-accent-cyan)' }}>
                        {row.ip_address}
                      </code>
                    </td>

                    {/* App + Event Type */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* App badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            width: '22px', height: '22px', borderRadius: '5px',
                            background: `${meta.color}18`, color: meta.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                          }}>
                            {meta.icon}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: meta.color }}>{meta.label}</span>
                        </div>
                        {/* Event type badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: evMeta.color, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                            {evMeta.icon}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', fontWeight: 600 }}>
                            {evMeta.label}
                          </span>
                          {row.browser && row.event_type === 'activity' && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                              — {row.os}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location / Details */}
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.82rem', color: 'var(--clr-text-secondary)' }}>
                        <MdLocationOn style={{
                          fontSize: '0.95rem', flexShrink: 0, marginTop: '1px',
                          color: row.event_type === 'failed' ? 'var(--clr-accent-red)' : 'var(--clr-text-muted)'
                        }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {row.location}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge badge-${row.status === 'suspicious' ? 'danger' : row.status === 'blocked' ? 'warning' : 'success'}`}>
                        <span className="badge-dot" />
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, totalItems)} of {totalItems} events
            </span>
            <div className="pagination">
              <button className="pagination-btn" id="prev-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
              {[...Array(Math.min(totalPages, 8))].map((_, i) => (
                <button
                  key={i + 1}
                  id={`page-${i + 1}-btn`}
                  className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pagination-btn" id="next-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;
