import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
  MdPerson, MdEmail, MdLock, MdDevices, MdEdit,
  MdSecurity, MdCheckCircle, MdDelete, MdShield
} from 'react-icons/md';
import { FiMonitor, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const trustedDevices = [
  { id: 1, name: 'MacBook Pro', os: 'macOS 14', browser: 'Chrome 124', lastUsed: '2 hours ago', current: true },
  { id: 2, name: 'iPhone 15', os: 'iOS 17', browser: 'Safari 17', lastUsed: '1 day ago', current: false },
  { id: 3, name: 'Windows PC', os: 'Windows 11', browser: 'Edge 122', lastUsed: '3 days ago', current: false },
  { id: 4, name: 'iPad Pro', os: 'iPadOS 17', browser: 'Safari 17', lastUsed: '1 week ago', current: false },
];

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [editModal, setEditModal] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [devices, setDevices] = useState(trustedDevices);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });

  const handleProfileSave = () => {
    updateUser({ ...user, ...profileForm });
    setEditModal(false);
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwModal(false);
    setPwForm({ current: '', newPw: '', confirm: '' });
    toast.success('Password changed successfully!');
  };

  const removeDevice = (id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.success('Device removed');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--clr-accent-blue)', width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdPerson />
            </span>
            User Profile
          </h1>
          <p className="page-subtitle">Manage your account settings and security preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px', height: '72px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: 'white',
              boxShadow: '0 0 30px rgba(59,130,246,0.3)',
            }}>
              {(user?.username || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: '4px' }}>
                {user?.username || 'Unknown User'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>{user?.email || 'No email set'}</p>
              <span className="badge badge-info" style={{ marginTop: '8px' }}>
                <MdShield style={{ fontSize: '0.75rem' }} />
                {user?.is_staff ? 'Administrator' : 'Standard User'}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setEditModal(true)}
            icon={<MdEdit />}
            variant="secondary"
            id="edit-profile-btn"
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid-cols-2" style={{ gap: '14px' }}>
          {[
            { icon: <MdPerson />, label: 'Username', value: user?.username || 'N/A', color: 'blue' },
            { icon: <MdEmail />, label: 'Email', value: user?.email || 'N/A', color: 'cyan' },
            { icon: <MdPerson />, label: 'First Name', value: user?.first_name || 'N/A', color: 'purple' },
            { icon: <MdPerson />, label: 'Last Name', value: user?.last_name || 'N/A', color: 'green' },
          ].map((field) => (
            <div key={field.label} style={{
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div className={`stat-icon ${field.color}`} style={{ width: '36px', height: '36px', fontSize: '1rem', marginBottom: 0 }}>
                {field.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {field.label}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdSecurity style={{ color: 'var(--clr-accent-blue)' }} /> Security Settings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdLock style={{ color: 'var(--clr-accent-blue)', fontSize: '1.2rem' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-text-primary)' }}>Password</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Last changed 30 days ago</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPwModal(true)} id="change-password-btn">
              Change Password
            </Button>
          </div>

          {[
            { label: '2-Factor Authentication', desc: 'SMS OTP enabled', status: true, color: 'green' },
            { label: 'Login Alerts', desc: 'Email & WhatsApp notifications', status: true, color: 'green' },
            { label: 'Geo-Location Monitoring', desc: 'Track login locations', status: true, color: 'green' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MdCheckCircle style={{ color: 'var(--clr-accent-green)', fontSize: '1.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{item.desc}</div>
                </div>
              </div>
              <span className="badge badge-normal">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdDevices style={{ color: 'var(--clr-accent-cyan)' }} /> Trusted Devices ({devices.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {devices.map((device) => (
            <div key={device.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${device.current ? 'rgba(59,130,246,0.3)' : 'var(--clr-border)'}`, borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-accent-blue)', fontSize: '1.1rem' }}>
                  {device.name.toLowerCase().includes('iphone') || device.name.toLowerCase().includes('ipad') ? <FiSmartphone /> : <FiMonitor />}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--clr-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {device.name}
                    {device.current && <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                    {device.os} · {device.browser} · Last used {device.lastUsed}
                  </div>
                </div>
              </div>
              {!device.current && (
                <button
                  id={`remove-device-${device.id}-btn`}
                  onClick={() => removeDevice(device.id)}
                  className="btn btn-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--clr-accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <MdDelete /> Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Username', key: 'username', type: 'text', id: 'modal-username' },
            { label: 'Email', key: 'email', type: 'email', id: 'modal-email' },
            { label: 'First Name', key: 'first_name', type: 'text', id: 'modal-first-name' },
            { label: 'Last Name', key: 'last_name', type: 'text', id: 'modal-last-name' },
          ].map((f) => (
            <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id}
                type={f.type}
                className="form-input"
                value={profileForm[f.key]}
                onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setEditModal(false)} id="cancel-edit-btn">Cancel</Button>
            <Button onClick={handleProfileSave} id="save-profile-btn">Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={pwModal} onClose={() => setPwModal(false)} title="Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Current Password', key: 'current', id: 'modal-current-pw' },
            { label: 'New Password', key: 'newPw', id: 'modal-new-pw' },
            { label: 'Confirm New Password', key: 'confirm', id: 'modal-confirm-pw' },
          ].map((f) => (
            <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id}
                type="password"
                className="form-input"
                value={pwForm[f.key]}
                onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setPwModal(false)} id="cancel-pw-btn">Cancel</Button>
            <Button onClick={handlePasswordChange} id="save-pw-btn">Update Password</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
