import React, { useState, useEffect } from 'react';
import LeftShowcase from './LeftShowcase';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import SnowEffect from './SnowEffect';
import { useAuth } from '../context/AuthContext';
import { SproutLogo } from './Icons';

export default function EntryPage() {
  const { language, setLanguage, t } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Monitor scroll position to adapt transparent navbar styling and center logo reveal
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      if (y > 70) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate reveal progress for center project name when user scrolls
  let revealProgress = 0;
  if (scrollY < 20) {
    revealProgress = 0;
  } else if (scrollY < 180) {
    revealProgress = (scrollY - 20) / 160;
  } else if (scrollY <= 550) {
    revealProgress = 1.0;
  } else if (scrollY < 800) {
    revealProgress = Math.max(0, 1.0 - (scrollY - 550) / 250);
  } else {
    revealProgress = 0;
  }

  const centerOpacity = revealProgress;
  const centerScale = 0.88 + revealProgress * 0.12;

  const scrollToFeatures = () => {
    const el = document.getElementById('landing-features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortalEntry = () => {
    const el = document.getElementById('landing-portal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-master-container">
      {/* 1. Transparent Floating Navigation Bar */}
      <header className={`landing-navbar ${scrolled ? 'navbar-scrolled' : 'navbar-transparent'}`}>
        <div className="landing-nav-inner">
          {/* Brand Logo & Title */}
          <div className="landing-brand-box" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-logo-pill">
              <SproutLogo size={28} />
            </div>
            <div className="landing-brand-text">
              <span className="brand-primary-text">{t.appName || 'AgroRise AI'}</span>
              <span className="brand-tag-ai">എ.ഐ</span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="landing-nav-links">
            <button type="button" onClick={scrollToFeatures} className="landing-nav-link-btn">
              {language === 'ml' ? 'പ്രധാന ഫീച്ചറുകൾ' : 'AI Features'}
            </button>
            <button type="button" onClick={scrollToPortalEntry} className="landing-nav-link-btn">
              {language === 'ml' ? 'കർഷക പോർട്ടൽ' : 'Farmer Hub'}
            </button>
          </nav>

          {/* Right Navigation Controls: Language & Transparent Sign In */}
          <div className="landing-nav-actions">
            {/* Language Quick Switcher */}
            <div className="landing-lang-toggle">
              <button
                type="button"
                className={`lang-btn ${language === 'ml' ? 'active' : ''}`}
                onClick={() => setLanguage('ml')}
                title="മലയാളം"
              >
                മലയാളം
              </button>
              <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Transparent Glass Sign In Button */}
            <button
              type="button"
              className="btn-nav-glass-login"
              onClick={() => setLoginOpen(true)}
            >
              <span>{t.signInCTA ? (language === 'ml' ? 'പ്രവേശിക്കുക' : 'Sign In') : 'Sign In'}</span>
            </button>

            {/* Vibrant Green Register CTA */}
            <button
              type="button"
              className="btn-nav-register"
              onClick={() => setRegisterOpen(true)}
            >
              <span>{language === 'ml' ? 'രജിസ്റ്റർ ചെയ്യുക' : 'Get Started'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Full-Screen Cinematic Sunrise Paddy Hero Section (Clean Wide Visual with Falling Fog Effect) */}
      <section className="landing-hero-fullscreen">
        <div className="hero-background-overlay" />
        <SnowEffect />

        {/* Scroll-Revealed Center Project Name: perfectly displays when scrolled */}
        <div 
          className="scroll-revealed-center-branding"
          style={{
            opacity: centerOpacity,
            transform: `translate(-50%, -50%) scale(${centerScale})`,
            pointerEvents: centerOpacity > 0.4 ? 'auto' : 'none',
            visibility: centerOpacity <= 0.01 ? 'hidden' : 'visible',
          }}
        >
          <div className="hero-status-badge">
            <span className="pulse-green-dot"></span>
            <span>
              {language === 'ml'
                ? '🌾 കേരളത്തിന്റെ ആദ്യ സ്മാർട്ട് കാർഷിക എ.ഐ പ്ലാറ്റ്‌ഫോം'
                : '🌾 Kerala Premier Precision Agriculture AI Platform'}
            </span>
          </div>

          <h1 className="hero-project-title">
            <span className="title-gradient">AgroRise</span>{' '}
            <span className="title-highlight">AI</span>
          </h1>

          <div className="hero-ml-subheading">
            {language === 'ml' ? 'അഗ്രോറൈസ് എ.ഐ • കൃഷിയിടത്തിൽ പുതിയ സാങ്കേതിക വിപ്ലവം' : 'Empowering Kerala Agriculture with Precision Intelligence'}
          </div>

          <p className="hero-description-text">
            {language === 'ml'
              ? 'മണ്ണിന്റെ തരം, പി.എച്ച്, കാലാവസ്ഥ എന്നിവ വിശകലനം ചെയ്ത് അനുയോജ്യമായ വിളകൾ ശുപാർശ ചെയ്യാനും, ഇലരോഗങ്ങൾ തിരിച്ചറിയാനും സഹായിക്കുന്ന സമഗ്ര കാർഷിക കൂട്ടുകാരൻ.'
              : 'Your synchronized farming companion. Harness smart land analysis, computer vision plant pathology, yield profitability forecasting, and 24/7 bilingual voice assistance in one unified hub.'}
          </p>

          <div className="hero-actions-group">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() => setLoginOpen(true)}
            >
              <span>{language === 'ml' ? '🚀 അഗ്രോറൈസിലേക്ക് പ്രവേശിക്കുക (Sign In)' : '🚀 Sign In to Dashboard'}</span>
              <span className="btn-arrow">→</span>
            </button>

            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => setRegisterOpen(true)}
            >
              <span>{language === 'ml' ? '🌱 പുതിയ കർഷക രജിസ്ട്രേഷൻ' : '🌱 Register Farmer Account'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Section */}
      <section id="landing-features-section" className="landing-features-container">
        <div className="features-header-box">
          <span className="section-pill-tag">
            {language === 'ml' ? 'എ.ഐ സവിശേഷതകൾ' : 'Intelligent Core Capabilities'}
          </span>
          <h2 className="section-main-heading">
            {language === 'ml'
              ? 'കേരള കർഷകർക്കായി രൂപകൽപ്പന ചെയ്ത ആധുനിക ടൂളുകൾ'
              : 'Precision Agronomic Technology Built for Kerala'}
          </h2>
          <p className="section-subtext">
            {language === 'ml'
              ? 'കേരള കാർഷിക സർവകലാശാല (KAU) മാനദണ്ഡങ്ങളും ഗൂഗിൾ ജെമിനി എ.ഐ സാങ്കേതികവിദ്യയും സമന്വയിപ്പിച്ച പ്ലാറ്റ്‌ഫോം'
              : 'Calibrated with Kerala Agricultural University (KAU) package of practices and state-of-the-art AI.'}
          </p>
        </div>

        <div className="landing-features-grid">
          {/* Card 1 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">🗺️</div>
            <h3>{language === 'ml' ? 'സ്മാർട്ട് ലാൻഡ് അനലൈസർ' : 'Smart Land Analyzer'}</h3>
            <p>
              {language === 'ml'
                ? 'മണ്ണുപരിശോധന, പി.എച്ച്, ചരിവ്, വെള്ളം, സീസൺ എന്നിവ പരിശോധിച്ച് മെഷീൻ ലേണിംഗ് വഴി ഏറ്റവും അനുയോജ്യമായ വിളകൾ റാങ്ക് ചെയ്യുന്നു.'
                : 'Evaluates soil type, pH, slope, water index, and seasonal cycles with Random Forest ML to recommend highest yielding crops.'}
            </p>
            <span className="feature-tech-badge">Random Forest (120 Trees)</span>
          </div>

          {/* Card 2 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">🍃</div>
            <h3>{language === 'ml' ? 'എ.ഐ ലീഫ് ഡോക്ടർ' : 'AI Leaf Disease Scanner'}</h3>
            <p>
              {language === 'ml'
                ? 'ഇലയുടെ ഫോട്ടോ മൊബൈൽ വഴി അപ്‌ലോഡ് ചെയ്ത് രോഗങ്ങളും കീടബാധകളും തത്സമയം കണ്ടെത്തുകയും KAU അംഗീകൃത പ്രതിവിധികൾ നേടുകയും ചെയ്യാം.'
                : 'Diagnoses foliar plant diseases instantly using computer vision, pairing each report with certified organic & chemical treatments.'}
            </p>
            <span className="feature-tech-badge">Computer Vision & Pathology</span>
          </div>

          {/* Card 3 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">💰</div>
            <h3>{language === 'ml' ? 'വിള ലാഭ-നഷ്ട അനുമാന കാൽക്കുലേറ്റർ' : 'Crop Profit & Loss Estimator'}</h3>
            <p>
              {language === 'ml'
                ? 'വിത്ത്, വളം, കൂലി ചെലവുകൾക്കനുസരിച്ച് 3 വ്യത്യസ്ത വിപണി സാഹചര്യങ്ങളിലെ ലാഭവും ബ്രേക്ക് ഈവൻ പോയിന്റും മുൻകൂട്ടി കണക്കാക്കാം.'
                : 'Simulates financial margins across 3 market risk scenarios (Low stress, Base wholesale, Peak festival prices) with break-even economics.'}
            </p>
            <span className="feature-tech-badge">Probabilistic Financial Modeling</span>
          </div>

          {/* Card 4 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">🤖</div>
            <h3>{language === 'ml' ? 'കിസാൻ മിത്രം വോയ്‌സ് അസിസ്റ്റന്റ്' : 'Malayalam Voice Assistant'}</h3>
            <p>
              {language === 'ml'
                ? 'ശുദ്ധ മലയാളത്തിൽ ചോദിക്കാനും സംസാരിച്ച് കൃത്യമായ മറുപടി കേൾക്കാനും സാധിക്കുന്ന ഇന്റലിജന്റ് വോയ്‌സ് ബോട്ട്.'
                : 'Real-time Malayalam speech recognition and vocal synthesis grounded in verified agricultural research documents.'}
            </p>
            <span className="feature-tech-badge">Web Speech API & RAG Grounding</span>
          </div>

          {/* Card 5 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">📰</div>
            <h3>{language === 'ml' ? '24-മണിക്കൂർ ലൈവ് കാർഷിക വാർത്തകൾ' : '24h Live Agri News & Advisory'}</h3>
            <p>
              {language === 'ml'
                ? 'സർക്കാർ താങ്ങുവില, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, സബ്‌സിഡികൾ എന്നിവ എല്ലാ ദിവസവും സ്വയമേവ അപ്‌ഡേറ്റ് ചെയ്യപ്പെടുന്നു.'
                : 'Live regional agricultural news scanned from RSS feeds and translated into actionable Malayalam farmer takeaways every 24 hours.'}
            </p>
            <span className="feature-tech-badge">Automated Daily Ingestion</span>
          </div>

          {/* Card 6 */}
          <div className="feature-show-card">
            <div className="card-icon-bubble">👨‍🌾</div>
            <h3>{language === 'ml' ? 'കർഷക ഡയറക്ടറിയും സംശയ നിവാരണവും' : 'Farmers Directory & Enquiry'}</h3>
            <p>
              {language === 'ml'
                ? 'സാക്ഷ്യപ്പെടുത്തിയ കർഷകരെ കണ്ടെത്താനും കൃഷിയിട വിവരങ്ങൾ കാണാനും വിള സംശയങ്ങൾക്ക് നേരിട്ട് മറുപടി നേടാനും സാധിക്കുന്നു.'
                : 'Connect with certified Kerala farmers, view verified land imagery, and consult directly on cultivation doubts.'}
            </p>
            <span className="feature-tech-badge">Direct Agricultural Consultation</span>
          </div>
        </div>
      </section>

      {/* 4. Portal Entry & Showcase Section (The Interactive Telemetry Hub) */}
      <section id="landing-portal-section" className="landing-portal-showcase-section">
        <div className="entry-page-split-layout">
          {/* Left: Modern Farm Visual with Interactive Telemetry */}
          <div className="flex-1">
            <LeftShowcase />
          </div>

          {/* Right: Quick Action Login & Register Box */}
          <div className="entry-cta-card">
            <div className="cta-header">
              <div className="cta-icon-wrapper">
                <SproutLogo size={36} />
              </div>
              <h2 className="cta-title">{t.appName || 'AgroRise AI'}</h2>
              <p className="cta-desc">
                {language === 'ml'
                  ? 'നിങ്ങളുടെ കർഷക അല്ലെങ്കിൽ സന്ദർശക അക്കൗണ്ടിലേക്ക് പ്രവേശിക്കുക'
                  : 'Sign in to access your farmer or agricultural visitor dashboard'}
              </p>
            </div>

            <button 
              type="button" 
              className="btn-cta-primary-login" 
              onClick={() => setLoginOpen(true)}
            >
              <span>{t.signInCTA || (language === 'ml' ? 'ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുക →' : 'Sign In to Dashboard →')}</span>
            </button>

            <div className="cta-register-row">
              <span>{t.newFarmer || (language === 'ml' ? 'പുതിയ കർഷകനാണോ?' : 'New farmer?')}</span>
              <button 
                type="button" 
                className="btn-cta-text-register" 
                onClick={() => setRegisterOpen(true)}
              >
                {t.registerLink || (language === 'ml' ? 'പുതിയ അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക' : 'Create an Account')}
              </button>
            </div>

            {/* Compliance Badge */}
            <div className="cta-compliance-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" style={{ marginRight: 6 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>{t.encryptedNote || (language === 'ml' ? 'സുരക്ഷിതവും എൻക്രിപ്റ്റ് ചെയ്തതുമായ കാർഷിക പ്ലാറ്റ്‌ഫോം' : 'Secure & Encrypted • Kerala Agronomy Compliant')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Clean Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <SproutLogo size={24} />
            <span>AgroRise AI • അഗ്രോറൈസ് എ.ഐ</span>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} AgroRise AI. Built for Kerala Agriculture • KAU & Krishi Bhavan Standards Compliant.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onOpenRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        />
      )}
      {registerOpen && (
        <RegisterModal
          isOpen={true}
          onClose={() => setRegisterOpen(false)}
          onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
        />
      )}
    </div>
  );
}
