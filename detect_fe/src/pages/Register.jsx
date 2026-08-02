import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
  MdPerson, MdEmail, MdPhone, MdLock, MdShield, MdVisibility,
  MdVisibilityOff, MdVpnKey, MdArrowBack, MdHourglassTop, MdCheckCircle
} from 'react-icons/md';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const ADMIN_CODE = 'deek@2002';

const Register = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', phone: '', password: '', adminCode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter valid 10-digit number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.adminCode.trim()) e.adminCode = 'Admin code is required';
    else if (form.adminCode !== ADMIN_CODE) e.adminCode = 'Invalid admin code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendBossEmailNotification = async (userData) => {
    try {
      await emailjs.send(
        'service_jzjhq0n',
        'template_ihfzf4g',
        {
          to_email: 'tharunyabm535@gmail.com',
          to_name: 'Boss',
          from_name: userData.username,
          user_name: userData.username,
          user_email: userData.email,
          phone: userData.phone,
          created_at: new Date().toLocaleString(),
          message: `New Admin Account Created:\nName: ${userData.username}\nEmail: ${userData.email}\nPhone: ${userData.phone}`
        },
        'Mg727egd_A3-Kpz5S'
      );
    } catch (err) {
      console.error('EmailJS Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const userData = { username: form.username, email: form.email, phone: form.phone, password: form.password };
    const result = await register(userData);
    if (result?.success) {
      await sendBossEmailNotification(userData);
      setShowModal(true);
    }
  };

  const set = (key, val) => setForm({ ...form, [key]: val });

  return (
    <>
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(180,195,220,0.7)', fontSize: '0.85rem',
            padding: '0', marginBottom: '14px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(180,195,220,0.7)'}
        >
          <MdArrowBack style={{ fontSize: '18px' }} />
          Back to Sign In
        </button>

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div className="auth-logo">
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdShield style={{ color: 'white', fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>TheftGuard BackOffice</div>
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.2rem', marginTop: '12px', marginBottom: '2px' }}>Create Account</h1>
          <p className="auth-subtitle" style={{ marginBottom: '14px', fontSize: '0.8rem' }}>Register with admin authorization</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Two-column: Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" htmlFor="reg-name" style={{ fontSize: '0.75rem' }}>Full Name</label>
              <div className="form-input-icon">
                <span className="icon"><MdPerson /></span>
                <input id="reg-name" type="text" className="form-input" placeholder="Your name"
                  value={form.username} onChange={(e) => set('username', e.target.value)} autoComplete="name" />
              </div>
              {errors.username && <div className="form-error" style={{ fontSize: '0.7rem' }}>⚠ {errors.username}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" htmlFor="reg-email" style={{ fontSize: '0.75rem' }}>Email</label>
              <div className="form-input-icon">
                <span className="icon"><MdEmail /></span>
                <input id="reg-email" type="email" className="form-input" placeholder="Email address"
                  value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
              </div>
              {errors.email && <div className="form-error" style={{ fontSize: '0.7rem' }}>⚠ {errors.email}</div>}
            </div>
          </div>

          {/* Two-column: Phone + Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" htmlFor="reg-phone" style={{ fontSize: '0.75rem' }}>Phone</label>
              <div className="form-input-icon">
                <span className="icon"><MdPhone /></span>
                <input id="reg-phone" type="tel" className="form-input" placeholder="10-digit"
                  value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
              </div>
              {errors.phone && <div className="form-error" style={{ fontSize: '0.7rem' }}>⚠ {errors.phone}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" htmlFor="reg-password" style={{ fontSize: '0.75rem' }}>Password</label>
              <div className="form-input-icon" style={{ position: 'relative' }}>
                <span className="icon"><MdLock /></span>
                <input id="reg-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Password"
                  value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password"
                  style={{ paddingRight: '38px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(180,195,220,0.6)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.password && <div className="form-error" style={{ fontSize: '0.7rem' }}>⚠ {errors.password}</div>}
            </div>
          </div>

          {/* Admin Code */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="reg-admincode" style={{ fontSize: '0.75rem' }}>Admin Code</label>
            <div className="form-input-icon" style={{ position: 'relative' }}>
              <span className="icon"><MdVpnKey /></span>
              <input id="reg-admincode" type={showAdminCode ? 'text' : 'password'} className="form-input" placeholder="Enter admin authorization code"
                value={form.adminCode} onChange={(e) => set('adminCode', e.target.value)} autoComplete="off"
                style={{ paddingRight: '38px' }} />
              <button type="button" onClick={() => setShowAdminCode(!showAdminCode)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(180,195,220,0.6)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                {showAdminCode ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {errors.adminCode && <div className="form-error" style={{ fontSize: '0.7rem' }}>⚠ {errors.adminCode}</div>}
          </div>

          <Button type="submit" full isLoading={isLoading} size="lg" id="register-submit-btn">
            Create Account
          </Button>
        </form>
      </div>

      {/* Pending Approval Popup Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '20px',
            padding: '32px 28px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{
              width: '60px', height: '60px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '32px'
            }}>
              <MdHourglassTop />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Pending Super Admin Approval
            </h2>

            <p style={{ fontSize: '0.875rem', color: 'rgba(180,195,220,0.8)', lineHeight: '1.5', marginBottom: '24px' }}>
              Your account registration has been submitted successfully!
              <br /><br />
              <strong style={{ color: '#f59e0b' }}>Account Status: Pending Approval</strong>
              <br />
              Please wait until the <span style={{ color: '#60a5fa' }}>Super Admin</span> approves your account to log in.
            </p>

            <Button
              full
              size="lg"
              onClick={() => {
                setShowModal(false);
                navigate('/login');
              }}
            >
              <MdCheckCircle style={{ marginRight: '6px' }} /> Go to Login Page
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
