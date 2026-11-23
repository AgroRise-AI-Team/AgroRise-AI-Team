import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { otpApi } from '../services/api';
import { 
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ShieldCheckIcon 
} from './Icons';

export default function LoginForm({ onOpenRegister }) {
  const { login, setSessionData } = useAuth();

  // Mode: 'password' or 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Password Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login State
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Standard Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please enter both username and password.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      await login(username, password);
      setMessage({ type: 'success', text: 'Authentication successful! Welcome.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Invalid credentials. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sending OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const target = otpTarget.trim();
    if (!target) {
      setMessage({ type: 'error', text: 'Please enter your registered email or phone number.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await otpApi.sendOtp(target);
      setOtpSent(true);
      setTimer(60);
      const devHint = res.email_sent === false && res.dev_otp
        ? ` (Dev mode — check Django console or use code: ${res.dev_otp})`
        : '';
      setMessage({
        type: 'success',
        text: (res.message || `OTP sent to ${target}. Valid for 5 minutes.`) + devHint
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verifying OTP & Auto Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await otpApi.verifyOtp(otpTarget.trim(), code);
      if (res.verified) {
        if (res.tokens && res.user) {
          setSessionData(res.tokens, res.user);
          setMessage({ type: 'success', text: 'OTP verified! Signing in...' });
        } else {
          setMessage({
            type: 'success',
            text: 'Mobile/Email verified successfully! You can now create your profile.'
          });
          setTimeout(() => {
            onOpenRegister();
          }, 1500);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Verification failed. Please check the code.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-card">
      {/* Encrypted Portal Pill Badge */}
      <div className="security-pill">
        <LockIcon size={13} className="pill-icon" />
        <span>Encrypted Field Portal</span>
      </div>

      {/* Heading */}
      <div className="login-header">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">
          Sign in to access your AgroRise farmer account.
        </p>
      </div>

      {/* Auth Mode Toggle Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', background: '#f1f5f2', padding: '4px', borderRadius: '8px' }}>
        <button
          type="button"
          onClick={() => { setAuthMode('password'); setMessage(null); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: authMode === 'password' ? 600 : 400,
            background: authMode === 'password' ? '#fff' : 'transparent',
            color: authMode === 'password' ? '#0b7a3e' : '#555',
            boxShadow: authMode === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer'
          }}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('otp'); setMessage(null); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: authMode === 'otp' ? 600 : 400,
            background: authMode === 'otp' ? '#fff' : 'transparent',
            color: authMode === 'otp' ? '#0b7a3e' : '#555',
            boxShadow: authMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            cursor: 'pointer'
          }}
        >
          🔐 OTP Verification
        </button>
      </div>

      {/* Status Message Alert */}
      {message && (
        <div className={`status-alert alert-${message.type}`} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      {/* -------------------- PASSWORD FORM -------------------- */}
      {authMode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          {/* Username / Email Field */}
          <div className="form-group">
            <label htmlFor="username" className="input-label">Username or Email</label>
            <div className="input-wrapper">
              <MailIcon size={18} className="field-icon" />
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. suresh_farmer"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="input-label">Password</label>
            <div className="input-wrapper">
              <LockIcon size={18} className="field-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="custom-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); setAuthMode('otp'); }}>
              Reset via OTP
            </a>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span>Login to AgroRise</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* -------------------- OTP FORM -------------------- */
        <div className="auth-form">
          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="input-label">Email Address or Phone Number</label>
                <div className="input-wrapper">
                  <MailIcon size={18} className="field-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={otpTarget}
                    onChange={(e) => setOtpTarget(e.target.value)}
                    placeholder="e.g. farmer@gmail.com or 9876543210"
                    required
                  />
                </div>
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  We will send a 6-digit OTP code to your Gmail address or mobile.
                </small>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Enter 6-digit OTP</label>
                  <button 
                    type="button" 
                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                    style={{ background: 'none', border: 'none', color: '#0b7a3e', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    Change ({otpTarget})
                  </button>
                </div>

                <div className="input-wrapper">
                  <LockIcon size={18} className="field-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    style={{ letterSpacing: '0.4rem', fontSize: '1.2rem', textAlign: 'center' }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <span>Verify &amp; Sign In</span>
                    <span className="btn-arrow">✓</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem' }}>
                {timer > 0 ? (
                  <span style={{ color: '#777' }}>Resend code in {timer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOtp}
                    style={{ background: 'none', border: 'none', color: '#0b7a3e', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Create Account Link */}
      <div className="register-prompt">
        <span>Don't have an account? </span>
        <button 
          type="button" 
          className="register-link-btn"
          onClick={onOpenRegister}
        >
          Create Account
        </button>
      </div>

      {/* Enterprise Security Shield Footer */}
      <div className="security-footer">
        <ShieldCheckIcon size={18} className="shield-icon" />
        <span className="security-text">
          Protected by AgroRise Enterprise Security &amp; Farm Privacy Shield
        </span>
      </div>
    </div>
  );
}
