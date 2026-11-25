import React, { useState } from 'react';
import { enquiryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ContactFarmerModal({ farmer, isOpen, onClose, onSuccess }) {
  const { user, language, t } = useAuth();

  const [senderName, setSenderName] = useState(() => {
    if (user?.first_name || user?.last_name) return `${user.first_name} ${user.last_name}`.trim();
    return user?.username || '';
  });
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [senderPhone, setSenderPhone] = useState(user?.profile?.phone_number || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !farmer) return null;

  const quickTopics = [
    { label: language === 'ml' ? '🌱 കൃഷി രീതി / മണ്ണ്' : '🌱 Cultivation & Soil', val: 'Cultivation & Soil Advisory' },
    { label: language === 'ml' ? '🐛 രോഗബാധ / കീടങ്ങൾ' : '🐛 Pest & Disease Advice', val: 'Pest & Crop Disease Advice' },
    { label: language === 'ml' ? '🌾 വിത്ത് / ഇനം' : '🌾 Seed Variety Info', val: 'Seed Variety Information' },
    { label: language === 'ml' ? '📦 ഉൽപ്പന്നം വാങ്ങാൻ' : '📦 Farm Produce Enquiry', val: 'Produce Purchase Enquiry' },
    { label: language === 'ml' ? '❓ മറ്റ് സംശയങ്ങൾ' : '❓ General Farming Doubt', val: 'General Farming Question' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(language === 'ml' ? 'ദയവായി നിങ്ങളുടെ സംശയം രേഖപ്പെടുത്തുക' : 'Please describe your doubt or enquiry.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await enquiryApi.sendEnquiry({
        farmer_id: farmer.id,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        subject: subject.trim() || 'Agricultural Doubt / Enquiry',
        message: message.trim()
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        setSubject('');
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanPhone = farmer.phone_number ? farmer.phone_number.replace(/[^0-9+]/g, '') : '';

  return (
    <div className="contact-farmer-modal-backdrop" onClick={onClose}>
      <div className="contact-farmer-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="contact-modal-header">
          <div className="contact-header-farmer-info">
            <div className="contact-farmer-avatar">
              {farmer.farmer_display_name ? farmer.farmer_display_name.charAt(0).toUpperCase() : '👨‍🌾'}
            </div>
            <div>
              <h3 className="contact-farmer-title">
                {language === 'ml' ? 'കർഷകനോട് ചോദിക്കാം' : 'Clear Doubts with Farmer'}
              </h3>
              <p className="contact-farmer-sub">
                <strong>{farmer.farmer_display_name}</strong> • 📍 {farmer.district} {farmer.current_crop ? `(Crop: ${farmer.current_crop})` : ''}
              </p>
            </div>
          </div>
          <button type="button" className="contact-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Direct Contact Bar (Phone / WhatsApp) if available */}
        {cleanPhone && (
          <div className="direct-contact-action-bar">
            <span className="direct-contact-label">
              {language === 'ml' ? 'നേരിട്ട് ബന്ധപ്പെടാം:' : 'Quick Direct Contact:'}
            </span>
            <div className="direct-contact-btns">
              <a 
                href={`tel:${cleanPhone}`} 
                className="quick-call-btn"
                title={`Call ${farmer.farmer_display_name}`}
              >
                📞 {language === 'ml' ? 'വിളിക്കുക' : 'Call'} ({farmer.phone_number})
              </a>
              <a 
                href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hello, I saw your farm profile on AgroRise AI and have a doubt regarding your crops.')}`}
                target="_blank" 
                rel="noreferrer"
                className="quick-whatsapp-btn"
                title="Chat on WhatsApp"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="contact-modal-form">
          {success ? (
            <div className="enquiry-success-card">
              <div className="success-icon-animated">✓</div>
              <h4>{language === 'ml' ? 'സംശയം വിജയകരമായി അയച്ചു!' : 'Enquiry Sent Successfully!'}</h4>
              <p>
                {language === 'ml' 
                  ? `${farmer.farmer_display_name} എന്ന കർഷകന് നിങ്ങളുടെ ചോദ്യം അയച്ചിട്ടുണ്ട്. കർഷകൻ ഉടൻ മറുപടി നൽകും.`
                  : `Your doubt has been submitted to ${farmer.farmer_display_name}. You can track it under 'Enquiries'.`}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="modal-error-alert">
                  ⚠️ {error}
                </div>
              )}

              {/* Quick Topics */}
              <div className="topic-chips-wrapper">
                <span className="topic-chips-title">
                  {language === 'ml' ? 'സംശയ വിഷയം തിരഞ്ഞെടുക്കാം:' : 'Select Doubt Topic:'}
                </span>
                <div className="topic-chips-row">
                  {quickTopics.map((top) => (
                    <button
                      type="button"
                      key={top.val}
                      className={`topic-chip ${subject === top.val ? 'selected' : ''}`}
                      onClick={() => setSubject(top.val)}
                    >
                      {top.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div className="form-group-item">
                <label className="form-item-label">
                  {language === 'ml' ? 'വിഷയം / Subject' : 'Enquiry Subject'}
                </label>
                <input
                  type="text"
                  className="form-item-input"
                  placeholder={language === 'ml' ? 'ഉദാ: നെൽകൃഷിയിലെ വളപ്രയോഗം' : 'e.g. Fertilizer timing for Pokkali rice'}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Question / Doubt Textarea */}
              <div className="form-group-item">
                <label className="form-item-label">
                  {language === 'ml' ? 'നിങ്ങളുടെ സംശയം / ചോദ്യം *' : 'Your Question / Farming Doubt *'}
                </label>
                <textarea
                  className="form-item-textarea"
                  rows={4}
                  required
                  placeholder={language === 'ml' 
                    ? 'വിശദമായ സംശയം ഇവിടെ എഴുതുക (വിളവ്, കാലാവസ്ഥ, രോഗലക്ഷണങ്ങൾ, ഉൽപ്പന്ന ലഭ്യത മുതലായവ)...'
                    : 'Describe your query or doubt in detail for the farmer (growth stage, symptoms, seeds, yield)...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Contact Info (Row) */}
              <div className="form-row-two-col">
                <div className="form-group-item">
                  <label className="form-item-label">
                    {language === 'ml' ? 'നിങ്ങളുടെ പേര്' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    className="form-item-input"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-item-label">
                    {language === 'ml' ? 'ഫോൺ നമ്പർ' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    className="form-item-input"
                    placeholder="e.g. +91 9876543210"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group-item">
                <label className="form-item-label">
                  {language === 'ml' ? 'ഇമെയിൽ വിലാസം' : 'Email Address (For reply notifications)'}
                </label>
                <input
                  type="email"
                  className="form-item-input"
                  placeholder="yourname@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="modal-actions-row">
                <button 
                  type="button" 
                  className="btn-cancel-modal" 
                  onClick={onClose}
                  disabled={submitting}
                >
                  {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn-submit-enquiry"
                  disabled={submitting}
                >
                  {submitting 
                    ? (language === 'ml' ? 'അയക്കുന്നു...' : 'Submitting Doubt...') 
                    : (language === 'ml' ? '📩 സംശയം കർഷകന് അയക്കുക' : '📩 Submit Doubt to Farmer')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
