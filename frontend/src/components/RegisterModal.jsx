import React, { useState, useEffect } from 'react';
import {
  KERALA_DISTRICTS,
  SOIL_TYPES,
  WATER_AVAILABILITY,
  LAND_AREA_UNITS,
  USER_ROLES
} from '../constants/enums';
import { useAuth } from '../context/AuthContext';
import { otpApi } from '../services/api';
import { LockIcon, MailIcon, SproutLogo } from './Icons';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpMsg, setOtpMsg] = useState(null); // { type: 'success'|'error', text }

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      role: 'FARMER',
      phone_number: '',
      district: 'Palakkad',
      preferred_language: 'ml',
      land_area: 1.0,
      land_area_unit: 'ACRES',
      soil_type: 'LATERITE',
      water_availability: 'MEDIUM',
      current_crop: 'Rice'
    }
  });

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: name === 'land_area' ? Number(value) : value
      }
    }));
  };

  // Step 1 → Step 2: validate & send OTP
  const handleGoToOtp = async () => {
    setError(null);
    if (!formData.username.trim()) return setError('Username is required.');
    if (!formData.email.trim()) return setError('Email is required.');
    if (!formData.profile.phone_number.trim()) return setError('Phone number is required.');
    if (!formData.password) return setError('Password is required.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await otpApi.sendOtp(formData.email.trim());
      setOtpSent(true);
      setTimer(60);
      const devHint = res.email_sent === false && res.dev_otp
        ? ` (Dev mode — OTP code: ${res.dev_otp})`
        : '';
      setOtpMsg({ type: 'success', text: (res.message || `OTP sent to ${formData.email}. Valid for 5 minutes.`) + devHint });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setOtpMsg(null);
    setLoading(true);
    try {
      const res = await otpApi.sendOtp(formData.email.trim());
      setTimer(60);
      const devHint = res.email_sent === false && res.dev_otp
        ? ` (Dev mode — OTP code: ${res.dev_otp})`
        : '';
      setOtpMsg({ type: 'success', text: (res.message || 'OTP resent successfully.') + devHint });
    } catch (err) {
      setOtpMsg({ type: 'error', text: err.message || 'Failed to resend OTP.' });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP → Step 3
  const handleVerifyOtp = async () => {
    setOtpMsg(null);
    const code = otpCode.trim();
    if (!code || code.length < 6) {
      return setOtpMsg({ type: 'error', text: 'Enter the 6-digit code sent to your email.' });
    }
    setLoading(true);
    try {
      await otpApi.verifyOtp(formData.email.trim(), code);
      setOtpVerified(true);
      setOtpMsg({ type: 'success', text: '✅ Email verified! Now complete your farm profile.' });
      setTimeout(() => setStep(3), 800);
    } catch (err) {
      setOtpMsg({ type: 'error', text: err.message || 'Invalid OTP. Please check and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Final submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile: formData.profile
      };
      await register(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { n: 1, label: 'Account Details' },
    { n: 2, label: 'Email Verification' },
    { n: 3, label: formData.profile.role === 'VISITOR' ? 'Preferences' : 'Farm Profile' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window register-modal-window" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <SproutLogo size={28} />
            <div>
              <h3>AgroRise AI Registration</h3>
              <p>Farmer Identity &amp; Agronomy Setup</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Step Bar */}
        <div className="step-bar">
          {stepLabels.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`step-item ${step === s.n ? 'active' : step > s.n ? 'completed' : ''}`}>
                <span className="step-num">
                  {step > s.n ? '✓' : s.n}
                </span>
                <span className="step-name">{s.label}</span>
              </div>
              {i < stepLabels.length - 1 && <div className="step-divider" />}
            </React.Fragment>
          ))}
        </div>

        {/* Global error */}
        {error && <div className="modal-error-alert">{error}</div>}

        {/* ─── STEP 1: Account Details ─── */}
        {step === 1 && (
          <div className="step-pane">
            <div className="form-row-2">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleAccountChange}
                  required
                  placeholder="e.g. suresh_farmer"
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleAccountChange}
                  required
                  placeholder="farmer@example.com"
                  className="modal-input"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Phone Number (Mobile)</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.profile.phone_number}
                  onChange={handleProfileChange}
                  required
                  placeholder="9876543210"
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.profile.role}
                  onChange={handleProfileChange}
                  className="modal-select"
                >
                  <option value="FARMER">Farmer (കർഷകൻ)</option>
                  <option value="VISITOR">Visitor / Consumer (സന്ദർശകൻ)</option>
                  <option value="BUYER">Buyer / Trader (വ്യാപാരി)</option>
                  <option value="BOTH">Farmer & Buyer</option>
                  <option value="EXPERT">Agricultural Officer / Expert</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleAccountChange}
                  required
                  placeholder="Min. 8 characters"
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleAccountChange}
                  required
                  placeholder="Repeat password"
                  className="modal-input"
                />
              </div>
            </div>

            <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#666' }}>
                Already registered?{' '}
                <button type="button" className="lm-link" onClick={onSwitchToLogin}>
                  Sign In
                </button>
              </span>
              <button
                type="button"
                className="btn-next"
                onClick={handleGoToOtp}
                disabled={loading}
              >
                {loading ? 'Sending OTP…' : 'Send OTP & Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Email OTP Verification ─── */}
        {step === 2 && (
          <div className="step-pane">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#e9feeb', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.6rem'
              }}>
                📧
              </div>
              <h3 style={{ margin: 0, color: '#0b7a3e', fontSize: '1.1rem' }}>Verify Your Email</h3>
              <p style={{ color: '#555', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
                A 6-digit code was sent to <strong>{formData.email}</strong>
              </p>
            </div>

            {/* OTP message */}
            {otpMsg && (
              <div
                className={`status-alert alert-${otpMsg.type}`}
                style={{ marginBottom: '1rem', textAlign: 'center' }}
              >
                {otpMsg.text}
              </div>
            )}

            {/* OTP Input */}
            <div className="form-group" style={{ maxWidth: 260, margin: '0 auto 1.2rem' }}>
              <label style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit OTP</label>
              <input
                type="text"
                className="modal-input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                maxLength={6}
                style={{
                  letterSpacing: '0.5rem',
                  fontSize: '1.4rem',
                  textAlign: 'center',
                  fontWeight: 700
                }}
                autoFocus
              />
            </div>

            {/* Resend */}
            <div style={{ textAlign: 'center', marginBottom: '1.4rem', fontSize: '0.82rem' }}>
              {timer > 0 ? (
                <span style={{ color: '#888' }}>Resend code in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#0b7a3e', fontWeight: 600, cursor: 'pointer' }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn-next"
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length < 6}
              >
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Farm Profile / Visitor Setup ─── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="step-pane">
              {formData.profile.role === 'VISITOR' ? (
                <div style={{ padding: '1rem', background: '#f5faf6', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid #cce3d2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>👁️</span>
                    <h4 style={{ margin: 0, color: '#0b7a3e', fontSize: '1.05rem' }}>Visitor Account Setup</h4>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#4a6b52', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    As a <strong>Visitor</strong>, you have access to the <strong>Main Agriculture Dashboard</strong> to view real agricultural data, land uploads, and crops published by registered farmers across Kerala.
                  </p>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Primary District of Interest</label>
                      <select
                        name="district"
                        value={formData.profile.district}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        {KERALA_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Preferred Language</label>
                      <select
                        name="preferred_language"
                        value={formData.profile.preferred_language}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>District (ജില്ല)</label>
                      <select
                        name="district"
                        value={formData.profile.district}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        {KERALA_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Current Crop (വിള)</label>
                      <input
                        type="text"
                        name="current_crop"
                        value={formData.profile.current_crop}
                        onChange={handleProfileChange}
                        placeholder="e.g. Rice / Paddy, Banana, Coconut"
                        className="modal-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Land Area</label>
                      <div className="input-group-combo">
                        <input
                          type="number"
                          step="0.1"
                          name="land_area"
                          value={formData.profile.land_area}
                          onChange={handleProfileChange}
                          className="modal-input"
                          required
                        />
                        <select
                          name="land_area_unit"
                          value={formData.profile.land_area_unit}
                          onChange={handleProfileChange}
                          className="modal-select-unit"
                        >
                          {LAND_AREA_UNITS.map(u => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Soil Type (മണ്ണ്)</label>
                      <select
                        name="soil_type"
                        value={formData.profile.soil_type}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        {SOIL_TYPES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Water Availability (ജലലഭ്യത)</label>
                      <select
                        name="water_availability"
                        value={formData.profile.water_availability}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        {WATER_AVAILABILITY.map(w => (
                          <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Language Preference</label>
                      <select
                        name="preferred_language"
                        value={formData.profile.preferred_language}
                        onChange={handleProfileChange}
                        className="modal-select"
                      >
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-footer-nav">
                <button type="button" className="btn-back" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="submit" className="btn-submit-register" disabled={loading}>
                  {loading ? 'Creating Profile…' : 'Complete Registration & Open Dashboard →'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
