import React, { useState, useEffect, useCallback } from 'react';
import {
  MdPeople, MdSearch, MdRefresh, MdShield, MdPowerSettingsNew,
  MdCheckCircle, MdBlock, MdDelete, MdFilterList, MdCheck, MdFileDownload,
  MdVolumeUp, MdVolumeOff
} from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { adminService } from '../services/adminService';
import UserHistoryExportModal from '../components/common/UserHistoryExportModal';
import { hackerAlarm } from '../utils/hackerAlarmSound';
import toast from 'react-hot-toast';

const riskColors = {
  low: 'badge-normal',
  medium: 'badge-warning',
  high: 'badge-suspicious',
  critical: 'badge-suspicious',
};

const UserTrack = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyModalUsers, setHistoryModalUsers] = useState(null); // null = closed
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('sentinel_hacker_alarm_muted') === 'true';
  });

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await adminService.getUsers();
      // Filter out admin/staff accounts — ONLY show end-users created from super-app-frontend
      const endUsersOnly = (data || []).filter(
        (u) => u.role !== 'admin' && !u.is_staff && u.username !== 'qwer1234'
      );
      setUsers(endUsersOnly);
    } catch (err) {
      console.error('Failed to fetch user track data:', err);
      if (!isSilent) toast.error('Failed to load user directory');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Periodic live threat check (every 8 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchUsers(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [fetchUsers]);

  // Identify cyber threat users: Risk Level HIGH / CRITICAL and Flagged count > 5
  const threatUsers = users.filter((u) => {
    const risk = (u.risk_level || '').toLowerCase();
    const isHighRisk = risk === 'high' || risk === 'critical';
    const flaggedCount = Number(u.suspicious_count || 0);
    return isHighRisk && flaggedCount > 5;
  });
  const hasHackerThreat = threatUsers.length > 0;

  // Sound Engine: Trigger hacker hacking siren if threat exists and audio is unmuted
  useEffect(() => {
    if (hasHackerThreat && !isMuted) {
      hackerAlarm.start();
    } else {
      hackerAlarm.stop();
    }
    return () => {
      hackerAlarm.stop();
    };
  }, [hasHackerThreat, isMuted]);

  // Synchronize mute state across pages/Navbar
  useEffect(() => {
    const handleSync = () => {
      setIsMuted(localStorage.getItem('sentinel_hacker_alarm_muted') === 'true');
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('sentinel_audio_mute_change', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('sentinel_audio_mute_change', handleSync);
    };
  }, []);

  // Toggle Mute / Unmute handler
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('sentinel_hacker_alarm_muted', String(next));
      window.dispatchEvent(new Event('sentinel_audio_mute_change'));
      if (next) {
        hackerAlarm.stop();
        toast('🔇 Hacker alert sound MUTED', { icon: '🔇' });
      } else {
        toast.success('🔊 Hacker alert sound UNMUTED');
        if (hasHackerThreat) {
          hackerAlarm.start();
        } else {
          // Play quick audible feedback
          hackerAlarm.playTestOnce();
        }
      }
      return next;
    });
  };

  // Filter by search
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())
  );

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Single user Safe Account Force Logout
  const handleForceLogout = async (userId, username) => {
    if (!window.confirm(`🚨 Are you sure you want to execute Safe Account force logout for "${username}"?\nThis will immediately terminate all active sessions across ALL devices.`)) {
      return;
    }
    try {
      await adminService.forceLogoutUser(userId);
      toast.success(`🛡️ Safe Account activated! Logged out ${username} from ALL devices.`);
      fetchUsers(true);
    } catch (err) {
      console.error('Force logout error:', err);
      toast.error(`Failed to force logout ${username}`);
    }
  };

  // Single user permanent DB delete
  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `⚠️ PERMANENT DATABASE DELETE!\n\nAre you sure you want to permanently delete user "${username}" from the database?\nThis will completely remove their account, login logs, and alert history.`
      )
    ) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      toast.success(`🗑️ User '${username}' permanently deleted from Database.`);
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
      fetchUsers(true);
    } catch (err) {
      console.error('Delete user error:', err);
      toast.error(`Failed to delete user '${username}' from DB`);
    }
  };

  // Bulk Safe Account Force Logout
  const handleBulkForceLogout = async () => {
    if (selectedUserIds.length === 0) return;
    if (
      !window.confirm(
        `🚨 Execute Safe Account bulk force logout for ${selectedUserIds.length} selected user account(s)?\nThis will immediately log them out from ALL devices.`
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      try {
        await adminService.bulkForceLogoutUsers(selectedUserIds);
      } catch (e) {
        // Fallback to individual force logout per user
        await Promise.all(selectedUserIds.map((id) => adminService.forceLogoutUser(id)));
      }
      toast.success(`🛡️ Safe Account activated! Logged out ${selectedUserIds.length} account(s) from ALL devices.`);
      setSelectedUserIds([]);
      fetchUsers(true);
    } catch (err) {
      console.error('Bulk force logout error:', err);
      toast.error('Failed to execute bulk force logout');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Permanent DB Delete
  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    if (
      !window.confirm(
        `⚠️ PERMANENT DATABASE BULK DELETE!\n\nAre you sure you want to PERMANENTLY DELETE ${selectedUserIds.length} selected user account(s) from the Database?\nAll associated login history & alerts will be erased forever.`
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      try {
        await adminService.bulkDeleteUsers(selectedUserIds);
      } catch (e) {
        // Fallback to individual permanent DB delete per user
        await Promise.all(selectedUserIds.map((id) => adminService.deleteUser(id)));
      }
      toast.success(`🗑️ ${selectedUserIds.length} user account(s) permanently deleted from Database.`);
      setSelectedUserIds([]);
      fetchUsers(true);
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to execute bulk delete from DB');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--clr-accent-blue)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdPeople />
            </span>
            User Track (End-User Accounts)
          </h1>
          <p className="page-subtitle">Track end-users created from Super App, execute emergency 'Safe Account' logout, or permanently delete accounts from DB</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const targets = selectedUserIds.length > 0
                ? filteredUsers.filter(u => selectedUserIds.includes(u.id))
                : filteredUsers;
              if (targets.length === 0) {
                toast.error('No users to export');
                return;
              }
              setHistoryModalUsers(targets);
            }}
            className="btn btn-sm btn-ghost"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid var(--clr-border)',
              background: 'rgba(56,189,248,0.08)',
              color: 'var(--clr-accent-cyan)',
              fontWeight: 600,
            }}
          >
            <MdFileDownload style={{ fontSize: '1.1rem' }} />
            Export
            {selectedUserIds.length > 0 && (
              <span style={{ background: 'rgba(56,189,248,0.2)', color: 'var(--clr-accent-cyan)', borderRadius: '10px', padding: '0 6px', fontSize: '0.72rem', fontWeight: 700 }}>
                {selectedUserIds.length}
              </span>
            )}
          </button>
          <button
            onClick={toggleMute}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: `1px solid ${isMuted ? 'var(--clr-border)' : (hasHackerThreat ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.5)')}`,
              background: isMuted ? 'rgba(255, 255, 255, 0.05)' : (hasHackerThreat ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.12)'),
              color: isMuted ? 'var(--clr-text-muted)' : (hasHackerThreat ? '#ef4444' : '#10b981'),
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={isMuted ? 'Unmute Hacker Alarm Notification' : 'Mute Hacker Alarm Notification'}
          >
            {isMuted ? <MdVolumeOff style={{ fontSize: '1.15rem' }} /> : <MdVolumeUp style={{ fontSize: '1.15rem' }} />}
            <span>{isMuted ? 'Sound Muted' : (hasHackerThreat ? '🚨 Alarm Siren (Mute)' : 'Sound On')}</span>
          </button>
          <button
            onClick={() => hackerAlarm.playTestOnce()}
            className="btn btn-sm btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', border: '1px solid var(--clr-border)' }}
            title="Preview / Test Hacker Siren Sound"
          >
            🔔 Test Sound
          </button>
          <button
            onClick={() => { setLoading(true); fetchUsers(); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MdRefresh /> Force Refresh
          </button>
        </div>
      </div>

      {/* Cyber Intrusion Hacker Attack Alert Banner */}
      {hasHackerThreat && (
        <div className="hacker-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2.2rem' }}>🚨</span>
            <div>
              <div style={{ fontWeight: 800, color: '#fca5a5', fontSize: '1.05rem', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                CYBER INTRUSION DETECTED: HIGH RISK &amp; &gt;5 FLAGGED SUSPICIOUS LOGINS!
                <span className="hacker-siren-dot" />
              </div>
              <div style={{ color: '#fecaca', fontSize: '0.86rem', marginTop: '3px' }}>
                Hacker attack in progress targeting account(s): <strong>{threatUsers.map(u => u.username).join(', ')}</strong>.
                {isMuted ? ' [Sound Alert Muted by Admin]' : ' [🚨 Hacker Intrusion Siren Playing 🔊]'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={toggleMute}
              className="btn btn-sm"
              style={{
                background: isMuted ? 'rgba(239, 68, 68, 0.3)' : '#ef4444',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 16px',
                boxShadow: isMuted ? 'none' : '0 0 15px rgba(239, 68, 68, 0.6)'
              }}
            >
              {isMuted ? <MdVolumeUp style={{ fontSize: '1.2rem' }} /> : <MdVolumeOff style={{ fontSize: '1.2rem' }} />}
              {isMuted ? 'Unmute Sound 🔔' : 'Mute Sound 🔇'}
            </button>
            <button
              onClick={() => hackerAlarm.playTestOnce()}
              className="btn btn-sm btn-ghost"
              style={{ color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)', fontWeight: 600 }}
              title="Test hacker siren audio"
            >
              Test Alarm
            </button>
          </div>
        </div>
      )}


      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-title">Total End Users</div>
          <div className="stat-card-value">{users.length}</div>
          <div className="stat-card-subtitle">Registered Super App users</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Active Accounts</div>
          <div className="stat-card-value" style={{ color: 'var(--clr-accent-green)' }}>
            {users.filter((u) => u.is_active).length}
          </div>
          <div className="stat-card-subtitle">Currently active status</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Suspicious Activity</div>
          <div className="stat-card-value" style={{ color: 'var(--clr-accent-amber)' }}>
            {users.filter((u) => u.suspicious_count > 0).length}
          </div>
          <div className="stat-card-subtitle">Users with flagged logins</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">High / Critical Risk</div>
          <div className="stat-card-value" style={{ color: 'var(--clr-accent-red)' }}>
            {users.filter((u) => u.risk_level === 'high' || u.risk_level === 'critical').length}
          </div>
          <div className="stat-card-subtitle">Requires security attention</div>
        </div>
      </div>

      {/* Bulk Action & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="search-bar" style={{ minWidth: '280px' }}>
            <MdSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search user by username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-bar-input"
            />
          </div>
          {selectedUserIds.length > 0 && (
            <span style={{ fontSize: '0.875rem', color: 'var(--clr-accent-blue)', fontWeight: 600 }}>
              {selectedUserIds.length} user(s) selected
            </span>
          )}
        </div>

        {selectedUserIds.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleBulkForceLogout}
              disabled={actionLoading}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}
            >
              <MdShield style={{ fontSize: '1.1rem' }} />
              🛡️ Safe Account ({selectedUserIds.length} Logout)
            </button>

            <button
              onClick={handleBulkDeleteUsers}
              disabled={actionLoading}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
              }}
            >
              <MdDelete style={{ fontSize: '1.1rem' }} />
              🗑️ Delete Selected ({selectedUserIds.length} DB Delete)
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Loading user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            No end-user accounts found matching your query.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Total Logins</th>
                  <th>Suspicious</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  const isThreatUser = (u.risk_level?.toLowerCase() === 'high' || u.risk_level?.toLowerCase() === 'critical') && Number(u.suspicious_count || 0) > 5;
                  return (
                    <tr
                      key={u.id}
                      className={isThreatUser ? 'hacker-threat-row' : ''}
                      style={{
                        background: isThreatUser
                          ? 'rgba(239, 68, 68, 0.14)'
                          : (isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined)
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(u.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: isThreatUser
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                              color: 'white',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              boxShadow: isThreatUser ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
                            }}
                          >
                            {u.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--clr-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {u.username}
                              {isThreatUser && <span className="hacker-siren-dot" title="Active hacker threat detected" />}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: isThreatUser ? '#fca5a5' : 'var(--clr-text-muted)' }}>
                              ID: {u.id?.slice(0, 8)}... {isThreatUser && '(TARGETED)'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--clr-text-secondary)', fontSize: '0.875rem' }}>
                        {u.email}
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.total_logins}</td>
                      <td>
                        {u.suspicious_count > 0 ? (
                          <span
                            className="badge badge-suspicious"
                            style={isThreatUser ? { border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.28)', fontWeight: 700 } : {}}
                          >
                            {u.suspicious_count} Flagged {isThreatUser && '🚨'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>0</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${riskColors[u.risk_level] || 'badge-normal'}`}
                          style={isThreatUser ? { animation: 'hackerPulse 1.2s infinite', border: '1px solid #ef4444' } : {}}
                        >
                          {(u.risk_level || 'low').toUpperCase()}
                        </span>
                        {isThreatUser && (
                          <div style={{ fontSize: '0.68rem', color: '#f87171', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span className="hacker-siren-dot" /> HACK ATTACK
                          </div>
                        )}
                      </td>
                      <td>
                        {u.is_active ? (
                          <span className="badge badge-normal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MdCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="badge badge-suspicious" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MdBlock /> Suspended
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
                        {formatDate(u.last_login)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleForceLogout(u.id, u.username)}
                            className="btn btn-sm"
                            style={{
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.2))',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              borderRadius: '6px'
                            }}
                            title="Safe Account — Force logout user from ALL active devices"
                          >
                            <MdShield style={{ fontSize: '0.95rem' }} />
                            🛡️ Safe Account
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="btn btn-sm"
                            style={{
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.2))',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              borderRadius: '6px'
                            }}
                            title="Permanently Delete User Account from Database"
                          >
                            <MdDelete style={{ fontSize: '0.95rem' }} />
                            🗑️ Delete DB
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Export Modal */}
      {historyModalUsers && (
        <UserHistoryExportModal
          users={historyModalUsers}
          onClose={() => setHistoryModalUsers(null)}
        />
      )}
    </div>
  );
};

export default UserTrack;
