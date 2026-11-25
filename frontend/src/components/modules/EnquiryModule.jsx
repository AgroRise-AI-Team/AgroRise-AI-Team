import React, { useState, useEffect } from 'react';
import { enquiryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EnquiryModule({ onGoToFarmersFeed }) {
  const { user, language, t } = useAuth();
  const profile = user?.profile || {};
  const isFarmer = profile.role === 'FARMER';

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PENDING, ANSWERED

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await enquiryApi.getEnquiries();
      setEnquiries(res.enquiries || []);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message || 'Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (enquiryId) => {
    const text = replyTextMap[enquiryId];
    if (!text || !text.trim()) return;

    setReplyingId(enquiryId);
    try {
      await enquiryApi.replyToEnquiry(enquiryId, text.trim());
      // Update local state
      setEnquiries(prev => prev.map(eq => {
        if (eq.id === enquiryId) {
          return { ...eq, reply: text.trim(), status: 'ANSWERED' };
        }
        return eq;
      }));
      setReplyTextMap(prev => ({ ...prev, [enquiryId]: '' }));
    } catch (err) {
      alert(err.message || 'Failed to submit reply');
    } finally {
      setReplyingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter(eq => {
    if (activeFilter === 'PENDING') return eq.status === 'PENDING';
    if (activeFilter === 'ANSWERED') return eq.status === 'ANSWERED';
    return true;
  });

  return (
    <div className="enquiry-module-container">
      {/* Hero Header */}
      <div className="enquiry-header-box">
        <div className="enquiry-header-left">
          <div className="enquiry-badge-tag">
            <span className="live-dot"></span>
            <span>{isFarmer ? (language === 'ml' ? 'കർഷക കൺസൾട്ടേഷൻ' : 'Farmer Consultation') : (language === 'ml' ? 'കർഷക സഹായം' : 'Farmer Support')}</span>
          </div>
          <h1 className="enquiry-page-title">
            {isFarmer 
              ? (language === 'ml' ? '📩 സന്ദർശകരിൽ നിന്ന് ലഭിച്ച സംശയങ്ങൾ' : '📩 Agricultural Doubts Received from Visitors')
              : (language === 'ml' ? '📩 എന്റെ കാർഷിക സംശയങ്ങളും മറുപടികളും' : '📩 My Farming Enquiries & Answers')}
          </h1>
          <p className="enquiry-page-sub">
            {isFarmer
              ? (language === 'ml' 
                  ? 'നിങ്ങളുടെ കൃഷിയിടത്തെക്കുറിച്ചും വിളവുകളെക്കുറിച്ചും സാധാരണ ഉപയോക്താക്കൾ ചോദിച്ച സംശയങ്ങൾക്ക് ഇവിടെ മറുപടി നൽകാം.'
                  : 'Respond to doubts asked by Kerala visitors and buyers regarding your cultivation practices and produce.')
              : (language === 'ml'
                  ? 'കേരളത്തിലെ കർഷകരോട് നിങ്ങൾ ചോദിച്ച ചോദ്യങ്ങളും അവർ നൽകിയ ഉത്തരങ്ങളും ഇവിടെ തത്സമയം കാണാം.'
                  : 'Track your queries and direct advice from verified Kerala farmers.')}
          </p>
        </div>

        {!isFarmer && onGoToFarmersFeed && (
          <button 
            type="button" 
            className="btn-browse-farmers-cta"
            onClick={onGoToFarmersFeed}
          >
            🌾 {language === 'ml' ? 'കർഷകരെ കാണാം / പുതിയ ചോദ്യം ചോദിക്കാം' : 'Browse Farmers & Ask New Doubt'}
          </button>
        )}
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="enquiry-filter-bar">
        <div className="enquiry-filter-buttons">
          <button 
            type="button" 
            className={`filter-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            {language === 'ml' ? 'എല്ലാം' : 'All'} ({enquiries.length})
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PENDING')}
          >
            ⏳ {language === 'ml' ? 'തീർച്ചയാക്കാത്തവ' : 'Pending'} ({enquiries.filter(e => e.status === 'PENDING').length})
          </button>
          <button 
            type="button" 
            className={`filter-tab-btn ${activeFilter === 'ANSWERED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ANSWERED')}
          >
            ✅ {language === 'ml' ? 'ഉത്തരം ലഭിച്ചവ' : 'Answered'} ({enquiries.filter(e => e.status === 'ANSWERED').length})
          </button>
        </div>

        <button type="button" className="enquiry-refresh-btn" onClick={fetchEnquiries} title="Refresh Enquiries">
          🔄 {language === 'ml' ? 'പുതുക്കുക' : 'Refresh'}
        </button>
      </div>

      {/* Content State */}
      {error && (
        <div className="dashboard-alert-error">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading-box">
          <div className="module-spinner"></div>
          <p>{language === 'ml' ? 'സംശയങ്ങൾ ലഭ്യമാക്കുന്നു...' : 'Loading enquiries & doubts...'}</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">🌱</div>
          <h3>{language === 'ml' ? 'സംശയങ്ങളൊന്നും കാണുന്നില്ല' : 'No Enquiries Found'}</h3>
          <p>
            {isFarmer 
              ? (language === 'ml' ? 'ഉപയോക്താക്കളിൽ നിന്ന് പുതിയ സംശയങ്ങളൊന്നും ലഭിച്ചിട്ടില്ല.' : 'You have not received any visitor doubts yet.')
              : (language === 'ml' ? 'നിങ്ങൾ കർഷകരോട് സംശയങ്ങളൊന്നും ചോദിച്ചിട്ടില്ല. കർഷകരുടെ പ്രൊഫൈലിൽ നിന്ന് ചോദിക്കാം!' : 'You have not submitted doubts to any farmers yet.')}
          </p>
          {!isFarmer && onGoToFarmersFeed && (
            <button type="button" className="reset-filters-btn" onClick={onGoToFarmersFeed}>
              {language === 'ml' ? 'കർഷക ഡയറക്ടറി കാണുക' : 'Explore Kerala Farmers Feed'}
            </button>
          )}
        </div>
      ) : (
        <div className="enquiries-grid">
          {filteredEnquiries.map(eq => (
            <div key={eq.id} className="enquiry-card">
              <div className="enquiry-card-top">
                <div className="enquiry-card-meta">
                  <span className={`status-pill ${eq.status === 'ANSWERED' ? 'answered' : 'pending'}`}>
                    {eq.status === 'ANSWERED' 
                      ? (language === 'ml' ? '✅ മറുപടി നൽകി' : '✅ Answered') 
                      : (language === 'ml' ? '⏳ മറുപടിക്കായി കാക്കുന്നു' : '⏳ Pending Response')}
                  </span>
                  <span className="enquiry-date">
                    {new Date(eq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="enquiry-participants">
                  {isFarmer ? (
                    <div className="participant-info">
                      <span className="participant-label">{language === 'ml' ? 'ചോദിച്ചയാൾ:' : 'From Visitor:'}</span>
                      <strong className="participant-name">{eq.sender_name}</strong>
                      {eq.sender_phone && <span className="contact-tag">📞 {eq.sender_phone}</span>}
                      {eq.sender_email && <span className="contact-tag">✉️ {eq.sender_email}</span>}
                    </div>
                  ) : (
                    <div className="participant-info">
                      <span className="participant-label">{language === 'ml' ? 'കർഷകൻ:' : 'Farmer:'}</span>
                      <strong className="participant-name">{eq.farmer_name}</strong>
                      {eq.farmer_district && <span className="contact-tag">📍 {eq.farmer_district}</span>}
                      {eq.farmer_crop && <span className="contact-tag">🌱 {eq.farmer_crop}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject & Question */}
              <div className="enquiry-body">
                <h4 className="enquiry-subject">{eq.subject}</h4>
                <p className="enquiry-question-text">{eq.message}</p>
              </div>

              {/* Farmer Answer / Reply */}
              {eq.reply ? (
                <div className="enquiry-answer-box">
                  <div className="answer-header">
                    <span>👨‍🌾 {language === 'ml' ? `കർഷകന്റെ മറുപടി (${eq.farmer_name}):` : `Farmer's Response (${eq.farmer_name}):`}</span>
                  </div>
                  <p className="answer-content">{eq.reply}</p>
                </div>
              ) : isFarmer ? (
                <div className="farmer-reply-action-box">
                  <textarea
                    rows={2}
                    className="reply-input"
                    placeholder={language === 'ml' ? 'കർഷകന്റെ മറുപടി ഇവിടെ രേഖപ്പെടുത്തുക...' : 'Type your advice / answer here...'}
                    value={replyTextMap[eq.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [eq.id]: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className="btn-send-reply"
                    disabled={replyingId === eq.id || !replyTextMap[eq.id]?.trim()}
                    onClick={() => handleReplySubmit(eq.id)}
                  >
                    {replyingId === eq.id 
                      ? (language === 'ml' ? 'അയക്കുന്നു...' : 'Sending...') 
                      : (language === 'ml' ? '✉️ മറുപടി അയക്കുക' : '✉️ Send Response')}
                  </button>
                </div>
              ) : (
                <div className="awaiting-reply-notice">
                  ℹ️ {language === 'ml' 
                    ? `${eq.farmer_name} എന്ന കർഷകനിൽ നിന്നുള്ള മറുപടിക്കായി കാത്തിരിക്കുന്നു. കർഷകന്റെ ഫോൺ നമ്പർ ഉണ്ടെങ്കിൽ നേരിട്ടും ബന്ധപ്പെടാം.` 
                    : `Awaiting response from ${eq.farmer_name}. You may also reach out directly if phone details are available.`}
                  {eq.farmer_phone && (
                    <div style={{ marginTop: '6px' }}>
                      <a href={`tel:${eq.farmer_phone}`} className="quick-call-link">
                        📞 Call Farmer: {eq.farmer_phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
