import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 8) {
      addToast('Security passkey must be at least 8 characters.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New security passkeys do not match.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      addToast('Security password changed successfully!', 'success');
      navigate('/profile');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Current password is incorrect.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Updating credentials keys..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/profile')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'hsl(var(--text-secondary))',
          fontWeight: 600,
          width: 'fit-content'
        }}
      >
        <ArrowLeft size={16} />
        Return to Profile
      </button>

      <form onSubmit={handlePasswordChange} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="hsl(var(--accent-red))" />
          Update Security Passkey
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Current Password</label>
          <input
            type="password"
            className="glass-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>New Password</label>
          <input
            type="password"
            className="glass-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Confirm New Password</label>
          <input
            type="password"
            className="glass-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
          Update Passkey
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;
