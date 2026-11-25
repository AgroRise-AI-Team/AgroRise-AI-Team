import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TopHeader({ activeTab = 'dashboard', onToggleSidebar, onSelectTab }) {
  const { user, language, setLanguage, t } = useAuth();
  const profile = user?.profile || {};
  const isFarmer = profile.role === 'FARMER';

  // Feature metadata based on activeTab and language
  const features = {
    dashboard: {
      icon: '🌾',
      title: isFarmer 
        ? (language === 'ml' ? 'കർഷക അഗ്രികൾച്ചർ ഫീഡ്' : 'Farmer Agriculture Feed & Live Records') 
        : (language === 'ml' ? 'സന്ദർശക ഡാഷ്‌ബോർഡ്' : 'Main Agriculture Visitors Dashboard'),
      subtitle: language === 'ml'
        ? 'കേരളത്തിലെ കർഷകർ നേരിട്ട് അപ്‌ലോഡ് ചെയ്ത കൃഷി വിവരങ്ങളും ഫോട്ടോകളും'
        : 'Explore verified farmer crop records, soil reports and field uploads across Kerala'
    },
    land_analyzer: {
      icon: '🗺️',
      title: language === 'ml' ? 'സ്മാർട്ട് ലാൻഡ് അനലൈസർ' : 'Smart Land Analyzer & Crop Recommender',
      subtitle: language === 'ml'
        ? 'മണ്ണിന്റെ തരം, കാലാവസ്ഥ, ഭൂപ്രകൃതി എന്നിവയ്ക്കനുസരിച്ചുള്ള വിള നിർദ്ദേശങ്ങൾ'
        : 'AI-driven soil, terrain, water & climate crop suitability recommendation engine'
    },
    profit_estimator: {
      icon: '💰',
      title: language === 'ml' ? 'വിള ലാഭ നഷ്ട അനുമാന കണക്കുകൂട്ടൽ' : 'Crop Cultivation Profit & Loss Estimator',
      subtitle: language === 'ml'
        ? 'വിള ഉൽപ്പാദനച്ചെലവും വരുമാനവും ലാഭ നഷ്ട സാധ്യതകളും കൃത്യമായി കണക്കാക്കുക'
        : 'Cultivation cost breakdown, harvest yield projections & ROI financial forecasting'
    },
    leaf_doctor: {
      icon: '🍃',
      title: language === 'ml' ? 'ഇലരോഗ നിർണ്ണയം (AI ലീഫ് ഡോക്ടർ)' : 'AI Leaf Disease Scanner & Pathology Doctor',
      subtitle: language === 'ml'
        ? 'ചിത്രം അപ്‌ലോഡ് ചെയ്ത് ഇലരോഗങ്ങൾ തിരിച്ചറിയുകയും പ്രതിവിധികൾ കണ്ടെത്തുകയും ചെയ്യുക'
        : 'Computer vision plant disease diagnosis and scientific KAU treatment protocols'
    },
    ai_chat: {
      icon: '🤖',
      title: language === 'ml' ? 'കിസാൻ മിത്രം AI അസിസ്റ്റന്റ്' : 'AgroRise Kisan Mitra AI Assistant',
      subtitle: language === 'ml'
        ? 'കാർഷിക സംശയങ്ങൾക്ക് ജെമിനി AI നൽകുന്ന കൃത്യമായ മറുപടികൾ'
        : 'Conversational agronomic intelligence powered by Google Gemini & KAU practices'
    },
    news: {
      icon: '📰',
      title: language === 'ml' ? 'കാർഷിക വാർത്തകളും കൃഷിഭവൻ അറിയിപ്പുകളും' : 'Kerala Agriculture News & Schemes',
      subtitle: language === 'ml'
        ? 'തത്സമയ കാർഷിക വാർത്തകൾ, സർക്കാർ സബ്‌സിഡികൾ, വിപണി വിലകൾ, കൃഷിഭവൻ അറിയിപ്പുകൾ'
        : 'Real-time agronomic intelligence, subsidies, market trends, and Krishi Bhavan advisories'
    },
    enquiries: {
      icon: '📩',
      title: isFarmer
        ? (language === 'ml' ? 'സന്ദർശകരിൽ നിന്ന് ലഭിച്ച കാർഷിക സംശയങ്ങൾ' : 'Received Visitor Doubts & Enquiries')
        : (language === 'ml' ? 'കർഷകരുമായി നടത്തിയ സംശയങ്ങളും അന്വേഷണങ്ങളും' : 'My Farming Enquiries & Answers'),
      subtitle: isFarmer
        ? (language === 'ml'
            ? 'നിങ്ങളുടെ കൃഷിയിടത്തെക്കുറിച്ചും വിളവുകളെക്കുറിച്ചും ചോദിച്ച സംശയങ്ങൾക്ക് മറുപടി നൽകാം'
            : 'Review and respond directly to agricultural questions submitted by Kerala visitors')
        : (language === 'ml'
            ? 'കേരളത്തിലെ കർഷകരോട് നിങ്ങൾ ചോദിച്ച ചോദ്യങ്ങളും കർഷകരുടെ മറുപടികളും'
            : 'Track doubts submitted to Kerala farmers and view their verified guidance')
    },
    profile: {
      icon: isFarmer ? '👤' : '⚙️',
      title: isFarmer 
        ? (language === 'ml' ? 'കർഷക പ്രൊഫൈലും കൃഷിയിട വിവരങ്ങളും' : 'Farmer Profile & Land Documentation') 
        : (language === 'ml' ? 'ഉപയോക്തൃ ക്രമീകരണങ്ങൾ' : 'Normal User Settings & Preferences'),
      subtitle: language === 'ml'
        ? 'നിങ്ങളുടെ കർഷക തിരിച്ചറിയൽ വിവരങ്ങളും കൃഷിയിട രേഖകളും ക്രമീകരിക്കുക'
        : 'Manage your identity, acreage, soil specifications, and verified credentials'
    }
  };

  const currentFeature = features[activeTab] || features.dashboard || {
    icon: '🌾',
    title: 'AgroRise',
    subtitle: 'Kerala Agricultural Intelligence'
  };

  return (
    <header className="app-top-header">
      <div className="top-header-inner">
        <div className="top-header-left">
          {/* Mobile Hamburger Menu Toggle */}
          <button 
            type="button" 
            className="top-header-hamburger-btn" 
            onClick={onToggleSidebar}
            aria-label="Toggle navigation sidebar"
            title="Toggle Navigation Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Current Active Feature Title & Details */}
          <div className="feature-header-info">
            <div className="feature-header-icon">
              <span>{currentFeature.icon}</span>
            </div>
            <div>
              <h2 className="feature-header-title">
                <span>{currentFeature.title}</span>
                <span className="feature-status-dot"></span>
              </h2>
              <p className="feature-header-subtitle">
                {currentFeature.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Right Controls */}
        <div className="top-header-right">
          {/* Role Pill Badge */}
          <span className={`top-role-pill ${isFarmer ? 'farmer-role' : 'user-role'}`}>
            <span className="role-dot"></span>
            <span>{isFarmer ? 'FARMER' : 'NORMAL USER'}</span>
          </span>

          {/* Language Quick Toggle */}
          <div className="top-lang-toggle">
            <button
              type="button"
              className={`top-lang-btn ${language === 'ml' ? 'active' : ''}`}
              onClick={() => setLanguage('ml')}
              title="മലയാളം"
            >
              മലയാളം
            </button>
            <button
              type="button"
              className={`top-lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
            >
              EN
            </button>
          </div>

          {/* User Profile Avatar Pill */}
          <div 
            className="top-user-pill" 
            onClick={() => onSelectTab && onSelectTab('profile')}
            title="View profile & settings"
          >
            <div className="top-user-avatar">
              {user?.username ? user.username.charAt(0).toUpperCase() : (isFarmer ? 'F' : 'U')}
            </div>
            <span className="top-username">{user?.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
