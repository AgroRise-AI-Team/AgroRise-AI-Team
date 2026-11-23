import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SproutLogo } from './Icons';

export default function Navbar({ activeTab = 'dashboard', onSelectTab }) {
  const { user, logout, language, toggleLanguage } = useAuth();
  const profile = user?.profile || {};
  const isFarmer = profile.role === 'FARMER' || profile.role === 'BOTH';

  return (
    <header className="dashboard-navbar">
      <div className="nav-container">
        {/* Left: Brand Identity */}
        <div 
          className="nav-brand" 
          onClick={() => onSelectTab && onSelectTab(isFarmer ? 'profile' : 'dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div className="nav-logo-box">
            <SproutLogo size={32} />
          </div>
          <div>
            <div className="nav-title-row">
              <span className="nav-brand-title">AgroRise AI</span>
              <span className={`nav-badge-pill ${isFarmer ? 'farmer-pill' : 'visitor-pill'}`}>
                {isFarmer ? 'Farmer Portal' : 'Visitor Portal'}
              </span>
            </div>
            <span className="nav-brand-sub">
              {isFarmer ? 'Farmer Account & Field Hub' : 'Kerala Agriculture Visitors Portal'}
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="nav-tab-links">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('dashboard')}
          >
            <span className="tab-icon">🌾</span>
            <span>{isFarmer ? 'Agriculture Feed' : 'Visitors Dashboard'}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('profile')}
          >
            <span className="tab-icon">{isFarmer ? '👤' : '⚙️'}</span>
            <span>{isFarmer ? 'Farmer Profile' : 'Account Settings'}</span>
          </button>
        </nav>

        {/* Right: User Identity & Controls */}
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
            title={isFarmer ? "Logged in Farmer" : "Logged in Visitor"}
            onClick={() => onSelectTab && onSelectTab('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar-circle">
              {user?.username ? user.username.charAt(0).toUpperCase() : (isFarmer ? 'F' : 'V')}
            </div>
            <div className="user-details-mini">
              <span className="user-name">
                {user?.username || (isFarmer ? 'Farmer' : 'Visitor')} 
                {profile.is_verified_farmer && <span className="verified-check" title="Verified Kerala Farmer">✓</span>}
              </span>
              <span className="user-location">
                {profile.role || 'VISITOR'} • {profile.district || 'Kerala'}
              </span>
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
