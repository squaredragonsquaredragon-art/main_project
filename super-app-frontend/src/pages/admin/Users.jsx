import React, { useEffect } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import Loader from '../../components/common/Loader';
import { User, ShieldAlert, CheckCircle, Ban, Award } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const UsersList = () => {
  const { adminUsers, fetchAdminUsers, adminUpdateUser, loading } = useSecurityStore();

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const handleToggleBlock = async (userId, isActive) => {
    await adminUpdateUser(userId, { is_active: !isActive });
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await adminUpdateUser(userId, { role: newRole });
  };

  if (loading && adminUsers.length === 0) {
    return <Loader message="Accessing active security nodes indexer..." size="large" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Registered User Directory</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '4px' }}>
          Monitor registered access credentials, modify nodes permissions, and toggles firewall quarantine.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Access Node (User)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Security Clearence</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Logs Scanned</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Risk Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Created Date</th>
              <th style={{ padding: '16px 20px', fontWeight: 600 }}>Operations</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((userNode) => (
              <tr
                key={userNode.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <User size={14} color="hsl(var(--accent-cyan))" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{userNode.username}</span>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{userNode.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span
                    className="badge"
                    style={{
                      background: userNode.role === 'admin' ? 'rgba(255,0,85,0.1)' : 'rgba(0,240,255,0.05)',
                      color: userNode.role === 'admin' ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-cyan))',
                      border: userNode.role === 'admin' ? '1px solid rgba(255,0,85,0.2)' : '1px solid rgba(0,240,255,0.15)'
                    }}
                  >
                    {userNode.role}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: 'hsl(var(--text-secondary))' }}>
                  {userNode.total_logins} logins ({userNode.suspicious_count} suspicious)
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span
                    className={`badge badge-${
                      userNode.risk_level === 'critical' || userNode.risk_level === 'high' ? 'danger' : userNode.risk_level === 'medium' ? 'warning' : 'success'
                    }`}
                  >
                    {userNode.risk_level}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: 'hsl(var(--text-muted))' }}>
                  {formatDate(userNode.created_at)}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Toggle quarantine / Block */}
                    <button
                      onClick={() => handleToggleBlock(userNode.id, userNode.is_active)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderColor: userNode.is_active ? 'hsla(var(--accent-red), 0.3)' : 'hsla(var(--accent-green), 0.3)',
                        color: userNode.is_active ? 'hsl(var(--accent-red))' : 'hsl(var(--accent-green))'
                      }}
                    >
                      {userNode.is_active ? <Ban size={12} /> : <CheckCircle size={12} />}
                      {userNode.is_active ? 'Quarantine' : 'Authorize'}
                    </button>

                    {/* Change Role */}
                    <button
                      onClick={() => handleChangeRole(userNode.id, userNode.role)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'hsl(var(--text-secondary))',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Award size={12} />
                      Toggle Admin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;
