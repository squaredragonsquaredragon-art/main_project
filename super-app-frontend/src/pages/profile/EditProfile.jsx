import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

const EditProfile = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateProfile({ first_name: firstName, last_name: lastName });
    if (res.success) {
      addToast('Profile metadata updated successfully!', 'success');
      navigate('/profile');
    } else {
      addToast(res.error, 'error');
    }
  };

  if (loading) return <Loader message="Updating node metadata records..." />;

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

      <form onSubmit={handleUpdate} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="hsl(var(--accent-cyan))" />
          Edit Node Identity
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>First name</label>
          <input
            type="text"
            className="glass-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Neo"
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Last name</label>
          <input
            type="text"
            className="glass-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Prime"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          <ShieldCheck size={16} />
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
