import React, { useState, useEffect, useCallback } from 'react';
import {
  MdPeople, MdSearch, MdRefresh, MdShield, MdPowerSettingsNew,
  MdCheckCircle, MdBlock, MdDelete, MdFilterList, MdCheck
} from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { adminService } from '../services/adminService';
import ExportButton from '../components/common/ExportButton';
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
          <ExportButton
            data={filteredUsers}
            filename="user_track_export"
            columns={[
              { key: 'id', label: 'User ID' },
              { key: 'username', label: 'Username' },
              { key: 'email', label: 'Email' },
              { key: 'is_active', label: 'Active Status' },
              { key: 'total_logins', label: 'Total Logins' },
              { key: 'suspicious_count', label: 'Suspicious Logins' },
              { key: 'risk_level', label: 'Risk Level' },
              { key: 'created_at', label: 'Registration Date' }
            ]}
          />
          <button
            onClick={() => { setLoading(true); fetchUsers(); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MdRefresh /> Force Refresh
          </button>
        </div>
      </div>

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
                  return (
                    <tr
                      key={u.id}
                      style={{
                        background: isSelected ? 'rgba(59, 130, 246, 0.08)' : undefined
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
                              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                              color: 'white',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem'
                            }}
                          >
                            {u.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--clr-text-primary)' }}>
                              {u.username}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                              ID: {u.id?.slice(0, 8)}...
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
                          <span className="badge badge-suspicious">{u.suspicious_count} Flagged</span>
                        ) : (
                          <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>0</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${riskColors[u.risk_level] || 'badge-normal'}`}>
                          {(u.risk_level || 'low').toUpperCase()}
                        </span>
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
    </div>
  );
};

export default UserTrack;
