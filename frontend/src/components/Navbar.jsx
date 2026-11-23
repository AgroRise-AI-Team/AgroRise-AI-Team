import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SproutLogo } from './Icons';

export default function Navbar({ activeTab = 'profile', onSelectTab }) {
  const { user, logout, language, toggleLanguage } = useAuth();
  const profile = user?.profile || {};

  return (
    <header className="dashboard-navbar">
      <div className="nav-container">
        {/* Left: Brand Identity */}
        <div className="nav-brand" onClick={() => onSelectTab && onSelectTab('profile')}>
          <div className="nav-logo-box">
            <SproutLogo size={32} />
          </div>
          <div>
            <div className="nav-title-row">
              <span className="nav-brand-title">AgroRise AI</span>
              <span className="nav-badge-pill">Farmer Portal</span>
            </div>
            <span className="nav-brand-sub">Farmer Account &amp; Profile Hub</span>
          </div>
        </div>

        {/* Right: Farmer Identity & Controls */}
        <div className="nav-actions">
          {/* Language Toggle */}
          <button 
            className="lang-toggle-btn" 
            onClick={toggleLanguage}
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            🌐 {language === 'ml' ? 'English' : 'മലയാളം'}
          </button>

          {/* User Profile Pill */}
          <div 
            className="user-profile-badge active"
            title="Logged In Farmer"
          >
            <div className="user-avatar-circle">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="user-details-mini">
              <span className="user-name">
                {user?.username || 'Farmer'} 
                {profile.is_verified_farmer && <span className="verified-check" title="Verified Kerala Farmer">✓</span>}
              </span>
              <span className="user-location">{profile.district || 'Kerala'} • {profile.current_crop || 'Rice'}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={logout} title="Sign Out">
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
