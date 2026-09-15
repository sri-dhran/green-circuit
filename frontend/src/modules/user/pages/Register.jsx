import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { officeService } from '../../center/api/officeService';
import GlassBackground from '../../../common/components/GlassBackground';
import './Login.css';

/* ── Inline SVG Icons ─────────────────────────────────────── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <line x1="9" y1="22" x2="9" y2="22.01"/>
    <line x1="15" y1="22" x2="15" y2="22.01"/>
    <line x1="9" y1="6" x2="9" y2="6.01"/>
    <line x1="15" y1="6" x2="15" y2="6.01"/>
    <line x1="9" y1="10" x2="9" y2="10.01"/>
    <line x1="15" y1="10" x2="15" y2="10.01"/>
    <line x1="9" y1="14" x2="9" y2="14.01"/>
    <line x1="15" y1="14" x2="15" y2="14.01"/>
  </svg>
);

const IconEyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconError = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('USER');
  const [officeId, setOfficeId] = useState('');
  const [offices, setOffices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnState, setBtnState] = useState('idle');

  const cardRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (role === 'OFFICE') {
      const fetchOffices = async () => {
        try {
          const data = await officeService.getAllOffices();
          setOffices(data || []);
        } catch {
          setError('Failed to fetch offices list.');
        }
      };
      fetchOffices();
    }
  }, [role]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * 3.5;
    const rotY = dx * 3.5;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s ease';
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = '';
      }, 500);
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || btnState === 'success') return;
    setError('');

    if (role === 'OFFICE' && !officeId) {
      setError('Please select an office to associate with your account.');
      return;
    }

    setLoading(true);
    setBtnState('loading');

    try {
      const userData = await register(
        name,
        email,
        password,
        role,
        role === 'OFFICE' ? officeId : undefined
      );

      setBtnState('success');
      setTimeout(() => {
        if (userData.role === 'OFFICE') {
          navigate('/dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }, 900);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      setError(errorMsg);
      setBtnState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="gc-login-root" onMouseMove={handleMouseMove}>
      <GlassBackground />

      <main className="gc-login-content" style={{ maxWidth: '460px' }}>
        <div
          className="gc-card"
          ref={cardRef}
          onMouseLeave={handleMouseLeave}
          role="region"
          aria-label="Registration form"
          style={{ maxWidth: '460px' }}
        >
          {/* Logo */}
          <div className="gc-logo-area">
            <div className="gc-logo-icon" aria-hidden="true">♻</div>
            <p className="gc-brand-name">Green Circuit</p>
            <h1 className="gc-welcome-heading">Create Account</h1>
            <p className="gc-welcome-sub">
              Join the smart e-waste recycling movement today.
            </p>
          </div>

          {/* Error toast */}
          {error && (
            <div className="gc-error-toast" role="alert" aria-live="polite">
              <span className="gc-error-icon" aria-hidden="true"><IconError /></span>
              {error}
            </div>
          )}

          {/* Role Switcher */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setRole('USER'); setOfficeId(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: role === 'USER' ? 'rgba(0, 230, 118, 0.2)' : 'transparent',
                color: role === 'USER' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: role === 'USER' ? '600' : '500',
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                border: role === 'USER' ? '1px solid rgba(0, 230, 118, 0.35)' : '1px solid transparent'
              }}
            >
              🌿 Individual User
            </button>
            <button
              type="button"
              onClick={() => setRole('OFFICE')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: role === 'OFFICE' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: role === 'OFFICE' ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: role === 'OFFICE' ? '600' : '500',
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                border: role === 'OFFICE' ? '1px solid rgba(0, 212, 255, 0.35)' : '1px solid transparent'
              }}
            >
              🏢 Collection Office
            </button>
          </div>

          <form className="gc-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="gc-input-group">
              <div className="gc-input-wrapper">
                <span className="gc-input-icon" aria-hidden="true"><IconUser /></span>
                <input
                  id="reg-name"
                  type="text"
                  className="gc-input"
                  placeholder=" "
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <label htmlFor="reg-name" className="gc-label">Full Name</label>
              </div>
            </div>

            {/* Email */}
            <div className="gc-input-group">
              <div className="gc-input-wrapper">
                <span className="gc-input-icon" aria-hidden="true"><IconEmail /></span>
                <input
                  id="reg-email"
                  type="email"
                  className="gc-input"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <label htmlFor="reg-email" className="gc-label">Email Address</label>
              </div>
            </div>

            {/* Password */}
            <div className="gc-input-group">
              <div className="gc-input-wrapper">
                <span className="gc-input-icon" aria-hidden="true"><IconLock /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="gc-input gc-input-password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <label htmlFor="reg-password" className="gc-label">Create Password</label>
                <button
                  type="button"
                  className="gc-eye-btn"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
              </div>
            </div>

            {/* Office selection for OFFICE role */}
            {role === 'OFFICE' && (
              <div className="gc-input-group">
                <label className="gc-input-label" style={{ fontSize: '0.8rem', color: '#00d4ff' }}>
                  Select Assigned Collection Office *
                </label>
                <div className="gc-input-wrapper">
                  <span className="gc-input-icon" aria-hidden="true"><IconBuilding /></span>
                  <select
                    className="gc-select-field"
                    value={officeId}
                    onChange={(e) => setOfficeId(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  >
                    <option value="">-- Choose an Office --</option>
                    {offices.map((o) => (
                      <option key={o.id || o.officeId} value={o.id || o.officeId}>
                        {o.officeName || o.name} ({o.city || o.area || 'Coimbatore'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={`gc-submit-btn gc-btn-${btnState}`}
              disabled={loading || btnState === 'success'}
            >
              {btnState === 'loading' ? (
                <span className="gc-btn-inner">
                  <span className="gc-spinner" aria-hidden="true" />
                  Creating Account…
                </span>
              ) : btnState === 'success' ? (
                <span className="gc-btn-inner">
                  <span className="gc-success-check" aria-hidden="true">✓</span>
                  Account Created!
                </span>
              ) : (
                <span className="gc-btn-inner">
                  Create Account <IconArrow />
                </span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="gc-card-footer">
            <p className="gc-footer-text">
              Already have an account?{' '}
              <RouterLink to="/login" className="gc-footer-link">
                Sign In
              </RouterLink>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
