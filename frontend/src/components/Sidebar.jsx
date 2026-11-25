import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SproutLogo } from './Icons';

export default function Sidebar({ activeTab = 'dashboard', onSelectTab, isOpen = false, onClose }) {
  const { user, logout, language, setLanguage, t } = useAuth();
  const profile = user?.profile || {};
  const isFarmer = profile.role === 'FARMER';

  const menuItems = isFarmer
    ? [
        {
          id: 'dashboard',
          icon: '🌾',
          label: t.tabFeed || 'Agriculture Feed',
          badge: 'Live',
        },
        {
          id: 'land_analyzer',
          icon: '🗺️',
          label: t.tabLandAnalyzer || 'Smart Land Analyzer',
          badge: 'AI/ML',
        },
        {
          id: 'profit_estimator',
          icon: '💰',
          label: t.tabProfitEstimator || 'Crop Profit Estimator',
          badge: 'Forecast',
        },
        {
          id: 'leaf_doctor',
          icon: '🍃',
          label: t.tabLeafDoctor || 'AI Leaf Doctor',
          badge: 'Vision',
        },
        {
          id: 'ai_chat',
          icon: '🤖',
          label: t.tabChatbot || 'AI Kisan Mitra',
          badge: 'Gemini',
        },
        {
          id: 'enquiries',
          icon: '📩',
          label: language === 'ml' ? 'കർഷക സംശയങ്ങൾ' : 'Received Doubts',
          badge: 'Inbox',
        },
        {
          id: 'profile',
          icon: '👤',
          label: t.tabProfile || 'Farmer Profile',
          badge: 'Farm',
        }
      ]
    : [
        {
          id: 'dashboard',
          icon: '👨‍🌾',
          label: language === 'ml' ? 'കർഷക ഡയറക്ടറി' : 'Farmers Directory',
          badge: 'Explore',
        },
        {
          id: 'news',
          icon: '📰',
          label: language === 'ml' ? 'കാർഷിക വാർത്തകൾ' : 'Agri News & Schemes',
          badge: 'Updates',
        },
        {
          id: 'enquiries',
          icon: '📩',
          label: language === 'ml' ? 'എന്റെ സംശയങ്ങൾ' : 'My Doubts / Enquiries',
          badge: 'Doubts',
        },
        {
          id: 'ai_chat',
          icon: '🤖',
          label: t.tabChatbot || 'AI Kisan Mitra',
          badge: 'Gemini',
        },
        {
          id: 'profile',
          icon: '⚙️',
          label: language === 'ml' ? 'അക്കൗണ്ട് വിവരങ്ങൾ' : 'Account Settings',
          badge: 'User',
        }
      ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header - Pinned at top of sidebar */}
      <div className="sidebar-brand-box">
        <div 
          className="brand-logo-clickable"
          onClick={() => onSelectTab && onSelectTab(isFarmer ? 'profile' : 'dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
        >
          <div className="sidebar-logo-wrapper">
            <SproutLogo size={30} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
            <span className="sidebar-brand-title">{t.appName || 'AgroRise AI'}</span>
            <div>
              <span className={`sidebar-role-badge ${isFarmer ? 'farmer-role' : 'user-role'}`}>
                {isFarmer ? 'Farmer Portal' : 'Normal User Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Close button for mobile drawer */}
        <button 
          type="button" 
          className="sidebar-close-mobile-btn" 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <div className="app-sidebar-top">
        {/* Feature Navigation Section */}
        <div className="sidebar-nav-section">
          <div className="sidebar-section-title">
            {language === 'ml' ? 'പ്രധാന ഫീച്ചറുകൾ' : 'NAVIGATION'}
          </div>

          <nav className="sidebar-nav-menu">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  title={item.label}
                >
                  <div className="nav-btn-left">
                    <span className="nav-btn-icon">{item.icon}</span>
                    <span className="nav-btn-label">{item.label}</span>
                  </div>
                  <span 
                    className="nav-btn-badge"
                    style={{ 
                      background: isActive ? '#0b7a3e' : '#f0fdf4',
                      color: isActive ? '#ffffff' : '#047857',
                      borderColor: isActive ? '#0b7a3e' : '#bbf7d0'
                    }}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer: User, Language & Logout */}
      <div className="sidebar-footer">
        {/* Language Selector */}
        <div className="sidebar-lang-box">
          <span className="sidebar-lang-label">
            {language === 'ml' ? 'ഭാഷ / Language:' : 'Language:'}
          </span>
          <div className="sidebar-lang-btns">
            <button
              type="button"
              className={`sidebar-lang-btn ${language === 'ml' ? 'active' : ''}`}
              onClick={() => setLanguage('ml')}
            >
              🇮🇳 മലയാളം
            </button>
            <button
              type="button"
              className={`sidebar-lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* User Profile Mini Card */}
        <div 
          className="sidebar-user-card"
          onClick={() => onSelectTab && onSelectTab('profile')}
          title="Go to profile"
        >
          <div className="sidebar-user-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : (isFarmer ? 'F' : 'U')}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">
              {user?.username || (isFarmer ? 'Farmer' : 'User')}
              {profile.is_verified_farmer && <span className="verified-check" title="Verified Kerala Farmer">✓</span>}
            </span>
            <span className="sidebar-user-sub">
              {isFarmer ? 'FARMER' : 'NORMAL USER'} • {profile.district || 'Kerala'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          type="button" 
          className="sidebar-logout-btn" 
          onClick={logout}
          title={t.logout || 'Log out'}
        >
          <span>🚪</span>
          <span>{t.logout || 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}
