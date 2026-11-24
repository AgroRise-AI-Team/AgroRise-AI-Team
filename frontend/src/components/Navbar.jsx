import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SproutLogo } from './Icons';

export default function Navbar({ activeTab = 'dashboard', onSelectTab }) {
  const { user, logout, language, setLanguage, toggleLanguage, t } = useAuth();
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
              <span className="nav-brand-title">{t.appName}</span>
              <span className={`nav-badge-pill ${isFarmer ? 'farmer-pill' : 'visitor-pill'}`}>
                {isFarmer ? t.farmerPortal : t.visitorPortal}
              </span>
            </div>
            <span className="nav-brand-sub">
              {isFarmer ? t.farmerSub : t.visitorSub}
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
            <span>{isFarmer ? t.tabFeed : t.tabDashboard}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'land_analyzer' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('land_analyzer')}
          >
            <span className="tab-icon">🗺️</span>
            <span>{t.tabLandAnalyzer}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'profit_estimator' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('profit_estimator')}
          >
            <span className="tab-icon">💰</span>
            <span>{t.tabProfitEstimator}</span>
          </button>


          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => onSelectTab && onSelectTab('profile')}
          >
            <span className="tab-icon">{isFarmer ? '👤' : '⚙️'}</span>
            <span>{isFarmer ? t.tabProfile : t.tabSettings}</span>
          </button>
        </nav>

        {/* Right: User Identity & Controls */}
        <div className="nav-actions">
          {/* Dual Language Switcher Pill */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: '10px', padding: '3px' }}>
            <button 
              type="button"
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'ml' ? '#047857' : 'transparent',
                color: language === 'ml' ? '#ffffff' : '#374151',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('ml');
              }}
              title="മലയാളത്തിലേക്ക് മാറ്റുക"
            >
              🇮🇳 മലയാളം
            </button>
            <button 
              type="button"
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'en' ? '#047857' : 'transparent',
                color: language === 'en' ? '#ffffff' : '#374151',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLanguage('en');
              }}
              title="Switch to English"
            >
              🇬🇧 English
            </button>
          </div>

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
          <button className="logout-btn" onClick={logout} title={t.logout}>
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
