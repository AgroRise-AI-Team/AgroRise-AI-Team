import React, { useState } from 'react';
import LeftShowcase from './LeftShowcase';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../context/AuthContext';

const EntryPage = () => {
  const { language, setLanguage, t } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="entry-page">
      {/* Left hero */}
      <div className="flex-1">
        <LeftShowcase />
      </div>

      {/* Right CTA panel */}
      <div className="entry-cta">
        {/* Top Language Toggle Switch */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', background: '#eef8ef', padding: '3px', borderRadius: '10px', border: '1px solid #cce8d0' }}>
            <button
              onClick={() => setLanguage('ml')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'ml' ? '#0b7a3e' : 'transparent',
                color: language === 'ml' ? '#ffffff' : '#4b5563',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🇮🇳 മലയാളം
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: language === 'en' ? '#0b7a3e' : 'transparent',
                color: language === 'en' ? '#ffffff' : '#4b5563',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Logo mark */}
        <div style={{ marginBottom: '1.5rem' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="16" fill="#e9feeb"/>
            <path d="M26 12C18.268 12 12 18.268 12 26s6.268 14 14 14 14-6.268 14-14S33.732 12 26 12z" fill="#c3e6cb"/>
            <path d="M26 18v8l5 3" stroke="#0b7a3e" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="26" cy="26" r="4" fill="#0b7a3e"/>
          </svg>
        </div>

        <h1>{t.appName}</h1>
        <p>{t.entryDesc}</p>

        <button className="btn-login" onClick={() => setLoginOpen(true)}>
          {t.signInCTA}
        </button>

        <p className="register-link">
          {t.newFarmer}{' '}
          <button onClick={() => setRegisterOpen(true)}>
            {t.registerLink}
          </button>
        </p>

        {/* Security note */}
        <div style={{ marginTop: '2rem', fontSize: '0.74rem', color: '#9abfa2', textAlign: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9abfa2" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {t.encryptedNote}
        </div>
      </div>

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
};

export default EntryPage;
