import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { MdEmail, MdLock, MdShield, MdVisibility, MdVisibilityOff, MdErrorOutline } from 'react-icons/md';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username or email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;

    const res = await login({
      username: form.username.trim(),
      password: form.password.trim()
    });

    if (res?.success) {
      navigate('/dashboard');
    } else if (res?.error) {
      setAuthError(res.error);
      toast.error(res.error);
    }
  };

  return (
    <div className="auth-card">
      {/* Logo */}
      <div className="auth-logo">
        <div style={{
          width: '42px', height: '42px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MdShield style={{ color: 'white', fontSize: '22px' }} />
        </div>
        <div style={{
          fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc'
        }}>TheftGuard BackOffice</div>
      </div>

      <h1 className="auth-title" style={{ marginTop: '20px' }}>Welcome Back</h1>
      <p className="auth-subtitle">Sign in to your account</p>

      {/* Auth Error Banner */}
      {authError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '18px',
          color: '#fca5a5',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <MdErrorOutline style={{ fontSize: '20px', flexShrink: 0, color: '#ef4444' }} />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">Username or Email</label>
          <div className="form-input-icon">
            <span className="icon"><MdEmail /></span>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Enter username or email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="username"
            />
          </div>
          {errors.username && <div className="form-error">⚠ {errors.username}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div className="form-input-icon" style={{ position: 'relative' }}>
            <span className="icon"><MdLock /></span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(180,195,220,0.6)', fontSize: '1rem',
                display: 'flex', alignItems: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          {errors.password && <div className="form-error">⚠ {errors.password}</div>}
        </div>

        <Button type="submit" full isLoading={isLoading} size="lg" id="login-submit-btn">
          Sign In
        </Button>
      </form>

      <div className="auth-divider">
        <span>Don't have an account?</span>
      </div>

      <Link to="/register">
        <Button variant="secondary" full size="lg" id="goto-register-btn">
          Create Account
        </Button>
      </Link>
    </div>
  );
};

export default Login;
