import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import './Login.css';

/* ── SVG Icons (inline, no extra deps) ─────────────────────── */
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

/* ── Eco floating icon list ──────────────────────────────────── */
const ECO_ICONS = ['♻', '⚡', '🌿', '💡', '🔋', '🌍'];

/* ── Main Component ─────────────────────────────────────────── */
const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Form state
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [btnState, setBtnState]     = useState('idle'); // idle | loading | success

    // Card 3D tilt refs
    const cardRef = useRef(null);
    const rafRef  = useRef(null);

    // Pre-fill remembered email
    useEffect(() => {
        const saved = localStorage.getItem('gc_remember_email');
        if (saved) { setEmail(saved); setRememberMe(true); }
    }, []);

    // Mouse parallax on card (desktop only)
    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current || window.innerWidth < 768) return;
        const rect = cardRef.current.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * 4;
        const rotY =  dx * 4;

        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (cardRef.current) {
                cardRef.current.style.transform =
                    `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.5s ease';
            cardRef.current.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            setTimeout(() => {
                if (cardRef.current) cardRef.current.style.transition = '';
            }, 500);
        }
    }, []);

    // Cleanup RAF on unmount
    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* ── Form submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || btnState === 'success') return;

        setError('');
        setLoading(true);
        setBtnState('loading');

        try {
            const userData = await login(email, password);

            // Remember me
            if (rememberMe) {
                localStorage.setItem('gc_remember_email', email);
            } else {
                localStorage.removeItem('gc_remember_email');
            }

            // Success animation then navigate
            setBtnState('success');
            setTimeout(() => {
                if (userData.role === 'SUPER_ADMIN' && userData.email?.toLowerCase() === 'sri741815@gmail.com') {
                    navigate('/admin');
                } else if (userData.role === 'OFFICE') {
                    navigate('/dashboard');
                } else {
                    navigate('/user-dashboard');
                }
            }, 900);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
            setBtnState('idle');
        } finally {
            setLoading(false);
        }
    };

    /* ── Toggle password visibility (must NOT submit form) ── */
    const handleTogglePassword = (e) => {
        e.preventDefault(); // Prevent any form submission
        e.stopPropagation();
        setShowPassword(prev => !prev);
    };

    /* ── Button label ── */
    const renderBtnContent = () => {
        if (btnState === 'loading') {
            return (
                <span className="gc-btn-inner">
                    <span className="gc-spinner" aria-hidden="true" />
                    Signing in…
                </span>
            );
        }
        if (btnState === 'success') {
            return (
                <span className="gc-btn-inner">
                    <span className="gc-success-check" aria-hidden="true">✓</span>
                    Welcome back!
                </span>
            );
        }
        return (
            <span className="gc-btn-inner">
                Sign In <IconArrow />
            </span>
        );
    };

    return (
        <>
            {/* ── Animated Background ── */}
            <div className="gc-login-root" onMouseMove={handleMouseMove}>

                <div className="gc-bg" aria-hidden="true">
                    {/* Gradient blobs */}
                    <div className="gc-blob gc-blob-1" />
                    <div className="gc-blob gc-blob-2" />
                    <div className="gc-blob gc-blob-3" />
                    <div className="gc-blob gc-blob-4" />
                </div>

                {/* Floating glass spheres */}
                <div className="gc-spheres" aria-hidden="true">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="gc-sphere" />
                    ))}
                </div>

                {/* Floating eco icons */}
                <div className="gc-eco-icons" aria-hidden="true">
                    {ECO_ICONS.map((icon, i) => (
                        <div key={i} className="gc-eco-icon">{icon}</div>
                    ))}
                </div>

                {/* ── Login Card ── */}
                <main className="gc-login-content">
                    <div
                        className="gc-card"
                        ref={cardRef}
                        onMouseLeave={handleMouseLeave}
                        role="region"
                        aria-label="Login form"
                    >
                        {/* Logo */}
                        <div className="gc-logo-area">
                            <div className="gc-logo-icon" aria-hidden="true">♻</div>
                            <p className="gc-brand-name">Green Circuit</p>
                            <h1 className="gc-welcome-heading">Welcome Back</h1>
                            <p className="gc-welcome-sub">
                                Continue your journey towards responsible e-waste management.
                            </p>
                        </div>

                        {/* Error toast */}
                        {error && (
                            <div
                                className="gc-error-toast"
                                role="alert"
                                aria-live="polite"
                            >
                                <span className="gc-error-icon" aria-hidden="true"><IconError /></span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="gc-form" onSubmit={handleSubmit} noValidate>

                            {/* Email field */}
                            <div className="gc-input-group">
                                <div className="gc-input-wrapper">
                                    <span className="gc-input-icon" aria-hidden="true">
                                        <IconEmail />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="gc-input"
                                        placeholder=" "
                                        autoComplete="email"
                                        autoFocus
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        aria-label="Email address"
                                        aria-required="true"
                                    />
                                    <label htmlFor="email" className="gc-label">Email Address</label>
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="gc-input-group">
                                <div className="gc-input-wrapper">
                                    <span className="gc-input-icon" aria-hidden="true">
                                        <IconLock />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="gc-input"
                                        placeholder=" "
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        aria-label="Password"
                                        aria-required="true"
                                        style={{ paddingRight: '48px' }}
                                    />
                                    <label htmlFor="password" className="gc-label">Password</label>

                                    {/* Eye toggle — type="button" prevents form submit */}
                                    <button
                                        type="button"
                                        className={`gc-eye-btn${showPassword ? ' visible' : ''}`}
                                        onClick={handleTogglePassword}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        tabIndex={0}
                                    >
                                        {showPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember / Forgot row */}
                            <div className="gc-row">
                                <label className="gc-remember">
                                    <input
                                        type="checkbox"
                                        className="gc-checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        aria-label="Remember me"
                                    />
                                    Remember me
                                </label>
                                <span
                                    className="gc-forgot"
                                    title="Please contact an administrator to reset your password."
                                    aria-label="Forgot password (contact administrator)"
                                >
                                    Forgot Password?
                                </span>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="gc-btn-login"
                                disabled={btnState === 'loading' || btnState === 'success'}
                                aria-label="Sign in to Green Circuit"
                            >
                                {renderBtnContent()}
                            </button>

                        </form>

                        {/* Footer */}
                        <div className="gc-divider">or</div>
                        <div className="gc-footer">
                            Don&apos;t have an account?{' '}
                            <RouterLink to="/register">Create account</RouterLink>
                        </div>

                    </div>
                </main>

                {/* Success overlay flash */}
                {btnState === 'success' && (
                    <div className="gc-success-overlay" aria-hidden="true">
                        <div className="gc-success-badge">✓</div>
                    </div>
                )}

            </div>
        </>
    );
};

export default Login;
