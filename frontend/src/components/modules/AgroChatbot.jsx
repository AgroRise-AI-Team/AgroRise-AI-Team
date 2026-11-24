import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatApi } from '../../services/api';
import './AgroChatbot.css';

export default function AgroChatbot({ isFullPage = false, onClose }) {
  const { language, t } = useAuth();

  const [isOpen, setIsOpen] = useState(isFullPage);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Load suggestion prompts on mount or language change
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await chatApi.getSuggestions(language);
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (err) {
        // Fallback default suggestions
        if (language === 'ml') {
          setSuggestions([
            '🌱 കേരളത്തിലെ വെട്ടുകല്ല് മണ്ണിൽ ഏറ്റവും അനുയോജ്യമായ വിളകൾ ഏവ?',
            '🐛 തെങ്ങിലെ കൊമ്പൻ ചെല്ലിയെ തുരത്താൻ എന്ത് ചെയ്യണം?',
            '🌧️ മഴക്കാലത്ത് കുരുമുളകിന് ദ്രുതവാട്ടം വരാതിരിക്കാൻ എന്ത് ചെയ്യണം?',
            '💰 കേരളത്തിൽ റബ്ബറിന്റെയും നെല്ലിന്റെയും നിലവിലെ താങ്ങുവില എത്ര?'
          ]);
        } else {
          setSuggestions([
            '🌱 What are the best high-yield crops for Kerala red loam soil?',
            '🐛 How do I prevent Rhinoceros beetle on my coconut palms?',
            '🌧️ What fungus protection is needed for pepper before monsoons?',
            '💰 What is the current government MSP for paddy and rubber?'
          ]);
        }
      }
    }
    loadSuggestions();
  }, [language]);

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Format history turns for API
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await chatApi.sendMessage(query, historyPayload, language);

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply || (language === 'ml' ? 'ക്ഷമിക്കണം, പ്രതികരണം ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.' : 'Sorry, could not retrieve a response.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: language === 'ml'
          ? '⚠️ സാങ്കേതിക തകരാർ നേരിട്ടു. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.'
          : '⚠️ Could not connect to Gemini AI. Please try again in a moment.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Helper to render text with basic bold & bullet formatting
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <div className="bot-formatted-content">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '6px' }} />;

          // Bullet line
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const clean = trimmed.replace(/^[\*\-•]\s*/, '');
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
            );
          }

          // Numbered line
          if (/^\d+\.\s/.test(trimmed)) {
            const clean = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
            );
          }

          // Normal paragraph
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text) => {
    // Replace **bold**
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Content of Chatbot Window
  const chatWindowContent = (
    <>
      {/* Header */}
      <div className="agro-chat-header">
        <div className="header-left">
          <div className="bot-avatar-circle">
            🌾
          </div>
          <div>
            <h3 className="bot-info-title">{t.chatTitle || 'AgroRise Kisan Mitra AI'}</h3>
            <div className="bot-status-tag">
              <span className="status-active-bullet" />
              <span>{t.chatOnlineStatus || 'Online • Gemini AI'}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={handleClearChat}
              title={t.chatClear || 'Clear Chat'}
            >
              🗑️
            </button>
          )}

          {!isFullPage && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="agro-chat-stream">
        {/* Welcome Hero Box */}
        <div className="chat-welcome-hero">
          <div className="welcome-title-row">
            <span>✨</span>
            <span>{t.chatWelcomeTitle || 'Namaskaram! How can I help your farm today?'}</span>
          </div>
          <p className="welcome-text">
            {t.chatWelcomeDesc || 'Ask questions in English or Malayalam about crop diseases, pest remedies, fertilizer doses, weather alerts, or government subsidies.'}
          </p>

          {/* Quick Suggestions Chips */}
          {suggestions.length > 0 && (
            <div className="chat-suggestions-group">
              <div className="suggestions-label">
                {t.chatSuggestedPrompt || 'Common Questions:'}
              </div>
              <div className="suggestions-grid">
                {suggestions.slice(0, 4).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    className="suggestion-chip-btn"
                    onClick={() => handleSendMessage(sugg)}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message History */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
          >
            <div className={`message-avatar ${msg.sender === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
              {msg.sender === 'user' ? '👤' : '🌾'}
            </div>

            <div className="message-card">
              {msg.sender === 'bot' ? (
                renderFormattedText(msg.text)
              ) : (
                <div className="user-message-text">{msg.text}</div>
              )}
              <span className="message-timestamp">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="chat-bubble-row bot-row">
            <div className="message-avatar bot-avatar">🌾</div>
            <div className="bot-typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-label">{t.chatThinking || 'Kisan Mitra is thinking...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="agro-chat-footer">
        <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chatPlaceholder || 'Ask about crops, pests, soil, schemes...'}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputText.trim() || isLoading}
          >
            <span>{t.chatSend || 'Send'}</span>
            <span>➤</span>
          </button>
        </form>
        <div className="chat-footer-note">
          Powered by Google Gemini AI • Kerala Agronomic Advisory
        </div>
      </div>
    </>
  );

  // If rendered as Full Page tab inside MainApp
  if (isFullPage) {
    return (
      <div className="agro-chat-full-page">
        {chatWindowContent}
      </div>
    );
  }

  // Otherwise, render as floating FAB and collapsible drawer
  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          className="agro-chat-fab"
          onClick={() => setIsOpen(true)}
          title="Open Kisan Mitra AI Chatbot"
        >
          <div className="fab-avatar-badge">
            🌾
            <span className="fab-pulse-dot" />
          </div>
          <span>{t.tabChatbot || 'AI Kisan Mitra'}</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="agro-chat-floating-window">
          {chatWindowContent}
        </div>
      )}
    </>
  );
}
