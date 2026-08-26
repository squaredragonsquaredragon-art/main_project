import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotification } from '../../context/NotificationContext';
import { validatePhoneNumber } from '../../utils/validators';
import Loader from '../../components/common/Loader';
import { ArrowLeft, User, ShieldCheck, Phone, AlertCircle } from 'lucide-react';

const EditProfile = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setFormError('');

    if (!phoneNumber || !phoneNumber.trim()) {
      const msg = 'Phone number is mandatory for 📲 security & WhatsApp alerts.';
      addToast(msg, 'warning');
      setPhoneError(msg);
      setFormError(msg);
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      const msg = 'Phone number must be 10-15 digits (e.g. +919876543210).';
      addToast(msg, 'warning');
      setPhoneError(msg);
      setFormError(msg);
      return;
    }

    const res = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber.trim()
    });
    if (res.success) {
      addToast('Profile metadata updated successfully!', 'success');
      navigate('/profile');
    } else {
      const errDetail = res.error || 'Update failed.';
      addToast(errDetail, 'error');
      setFormError(errDetail);
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

        {formError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: phoneError ? '#f87171' : 'hsl(var(--text-secondary))' }}>
            Phone Number <span style={{ color: '#10b981', fontSize: '11px' }}>📲 Alerts</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="tel"
              className="glass-input"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (phoneError) setPhoneError('');
                if (formError) setFormError('');
              }}
              placeholder="+919876543210"
              style={{
                paddingLeft: '38px',
                border: phoneError ? '1px solid #ef4444' : undefined,
                boxShadow: phoneError ? '0 0 10px rgba(239, 68, 68, 0.35)' : undefined
              }}
              required
            />
            <Phone size={16} color={phoneError ? '#f87171' : '#10b981'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          {phoneError && (
            <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <AlertCircle size={12} color="#f87171" />
              {phoneError}
            </span>
          )}
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

