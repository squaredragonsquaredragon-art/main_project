import React, { useState, useEffect, useCallback } from 'react';
import {
  MdSupervisorAccount, MdSearch, MdWarning, MdPerson,
  MdBlock, MdCheckCircle, MdBarChart, MdShield, MdRefresh, MdDelete
} from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const riskColors = {
  low: 'badge-normal',
  medium: 'badge-warning',
  high: 'badge-suspicious',
  critical: 'badge-suspicious',
};

const Admin = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({
    total_users: 0,
    active_users: 0,
    blocked_users: 0,
    total_logins: 0,
    total_suspicious: 0,
  });
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchAdminData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getUsers().catch(() => []),
        adminService.getStats().catch(() => ({
          total_users: 0,
          active_users: 0,
          blocked_users: 0,
          total_logins: 0,
          total_suspicious: 0,
        })),
      ]);
      setUsers(usersData);
      setSystemStats(statsData);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
      if (!isSilent) toast.error('Failed to load system-wide user data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData(false);
    const interval = setInterval(() => fetchAdminData(true), 6000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  const updateApprovalRegistry = (username, email, isApproved) => {
    try {
      const reg = JSON.parse(localStorage.getItem('theftguard_user_approvals') || '{}');
      if (username) reg[username.toLowerCase().trim()] = isApproved;
      if (email) reg[email.toLowerCase().trim()] = isApproved;
      localStorage.setItem('theftguard_user_approvals', JSON.stringify(reg));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBlock = async (userId, currentActiveState, username, email) => {
    const newActiveState = !currentActiveState;
    const actionLabel = newActiveState ? 'approve' : 'block';

    if (!window.confirm(`Are you sure you want to ${actionLabel} user account '${username}'?`)) {
      return;
    }

    setTogglingId(userId);
    try {
      // Update local approval registry
      updateApprovalRegistry(username, email, newActiveState);

      await adminService.updateUser(userId, { is_active: newActiveState }).catch(() => { });

      toast.success(newActiveState ? `Successfully APPROVED ${username}! User can now log in.` : `Successfully BLOCKED ${username}`);

      // Optimistically update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId || u.username === username ? { ...u, is_active: newActiveState } : u))
      );

      fetchAdminData(true);
    } catch (err) {
      console.error(`Failed to ${actionLabel} user:`, err);
      toast.error(`Error trying to ${actionLabel} user. Please try again.`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE user '${username}'? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success(`Successfully deleted user '${username}'`);
      
      // Remove user from state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      
      // Refresh stats
      fetchAdminData(true);
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const formatDateTime = (iso) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--clr-accent-purple)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdSupervisorAccount />
            </span>
            Super Admin Panel
          </h1>
          <p className="page-subtitle">Monitor all users and system-wide security activities</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => { setLoading(true); fetchAdminData(); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MdRefresh /> Force Refresh
          </button>
          <span className="badge badge-suspicious" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <FiAlertTriangle /> Admin Only
          </span>
        </div>
      </div>

      {/* System Stats Card Row */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: systemStats.total_users, icon: <MdPerson />, color: 'blue' },
          { label: 'Normal Logins', value: systemStats.total_logins, icon: <MdShield />, color: 'green' },
          { label: 'Security Anomalies', value: systemStats.total_suspicious, icon: <FiAlertTriangle />, color: 'red' },
          { label: 'Blocked Accounts', value: systemStats.blocked_users, icon: <MdBlock />, color: 'amber' },
        ].map((s) => (
          <div key={s.label} className={`glass-card stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users Database Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
              All Users ({filtered.length})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
              Real-time user block status, deactivation, and self-healing locks database
            </p>
          </div>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <span className="search-icon"><MdSearch /></span>
            <input
              id="admin-user-search"
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Account</th>
                <th>Total Operations</th>
                <th>Security Threats</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Last Login Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--clr-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <MdRefresh style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
                      Loading user directory from Postgres...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--clr-text-muted)' }}>
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{
                    borderLeft: !u.is_active ? '3px solid var(--clr-accent-amber)' : '3px solid transparent',
                    background: !u.is_active ? 'rgba(245, 158, 11, 0.01)' : undefined
                  }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar" style={{
                          width: '34px',
                          height: '34px',
                          fontSize: '0.8rem',
                          background: !u.is_active ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: !u.is_active ? 'var(--clr-accent-amber)' : 'var(--clr-accent-blue)',
                          border: !u.is_active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--clr-text-primary)', fontSize: '0.875rem' }}>
                            {u.username}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-text-primary)', fontWeight: 600 }}>{u.total_logins}</td>
                    <td>
                      <span style={{ color: u.suspicious_count > 5 ? 'var(--clr-accent-red)' : 'var(--clr-text-secondary)', fontWeight: u.suspicious_count > 5 ? 700 : 400 }}>
                        {u.suspicious_count > 0 && <FiAlertTriangle style={{ fontSize: '0.8rem', marginRight: '4px', verticalAlign: 'middle' }} />}
                        {u.suspicious_count}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${riskColors[u.risk_level] || 'badge-normal'}`}>
                        {u.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-normal' : 'badge-warning'}`}>
                        <span className="badge-dot" style={{ background: u.is_active ? 'var(--clr-accent-green)' : 'var(--clr-accent-amber)' }} />
                        {u.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                      {formatDateTime(u.last_login)}
                    </td>
                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        id={`toggle-user-${u.id}-btn`}
                        onClick={() => toggleBlock(u.id, u.is_active, u.username, u.email)}
                        disabled={togglingId === u.id}
                        className="btn btn-sm"
                        style={{
                          background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                          color: u.is_active ? 'var(--clr-accent-red)' : 'var(--clr-accent-green)',
                          border: u.is_active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
                          minWidth: '96px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '5px 12px'
                        }}
                      >
                        {togglingId === u.id ? (
                          'Updating...'
                        ) : u.is_active ? (
                          <>
                            <MdBlock />
                            Block
                          </>
                        ) : (
                          <>
                            <MdCheckCircle />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          cursor: 'pointer'
                        }}
                        title="Delete User"
                      >
                        <MdDelete />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Report Summary */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdWarning style={{ color: 'var(--clr-accent-amber)' }} /> PostgreSQL Live Threat Auditing Summary
        </h3>
        <div className="grid-cols-3" style={{ gap: '14px' }}>
          {[
            { type: 'Active Locked Nodes', count: users.filter(u => !u.is_active).length, desc: 'Accounts under cooldown or lock restriction', color: 'amber' },
            { type: 'High Risk Operators', count: users.filter(u => u.risk_level === 'high' || u.risk_level === 'critical').length, desc: 'Users exhibiting highly suspicious activity', color: 'red' },
            { type: 'Auditable System Accounts', count: users.length, desc: 'Unique master credentials across Apex/Insta/Store', color: 'blue' },
          ].map((a) => (
            <div key={a.type} style={{
              padding: '18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: `var(--clr-accent-${a.color})`, marginBottom: '6px' }}>
                {a.count}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-text-primary)', marginBottom: '4px' }}>
                {a.type}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
