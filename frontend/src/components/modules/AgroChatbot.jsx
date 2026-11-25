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

  // Voice Chat States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [voiceError, setVoiceError] = useState(null);
  const [activeVoiceLang, setActiveVoiceLang] = useState('ml'); // Default to Malayalam Voice Assistant
  const [latestVoiceQuery, setLatestVoiceQuery] = useState('');
  const [latestVoiceAnswer, setLatestVoiceAnswer] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isVoiceMode) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isVoiceMode]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Load suggestion prompts on mount or language change
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await chatApi.getSuggestions(language);
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (err) {
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

  // Clean Markdown & Emojis and expand abbreviations for Malayalam Speech Synthesis
  const cleanTextForSpeech = (raw) => {
    if (!raw) return '';
    let text = raw
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
      .replace(/\*(.*?)\*/g, '$1')     // remove italics
      .replace(/#+\s/g, '')             // remove headers
      .replace(/[`_~]/g, '')           // remove markdown symbols
      .replace(/https?:\/\/\S+/g, '')  // remove URLs
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // remove emojis

    if (activeVoiceLang === 'ml') {
      text = text
        .replace(/(\d+)\s*(?:g\/L|g\/l)/gi, '$1 ഗ്രാം ഒരു ലിറ്റർ വെള്ളത്തിൽ')
        .replace(/(\d+)\s*(?:ml\/L|ml\/l)/gi, '$1 മില്ലിലിറ്റർ ഒരു ലിറ്റർ വെള്ളത്തിൽ')
        .replace(/(\d+)\s*%/g, '$1 ശതമാനം')
        .replace(/(\d+)\s*kg/gi, '$1 കിലോഗ്രാം')
        .replace(/\bpH\b/gi, 'പി.എച്ച്')
        .replace(/\bMSP\b/gi, 'താങ്ങുവില')
        .replace(/\bFYM\b/gi, 'ചാണകപ്പൊടി')
        .replace(/\bKAU\b/gi, 'കേരള കാർഷിക സർവകലാശാല');
    }
    return text.trim();
  };

  // Text-to-Speech function
  const speakMessage = (rawText, msgId, onComplete) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);

    const clean = cleanTextForSpeech(rawText);
    const utterance = new SpeechSynthesisUtterance(clean);

    utterance.lang = activeVoiceLang === 'ml' ? 'ml-IN' : 'en-IN';
    utterance.rate = activeVoiceLang === 'ml' ? 0.92 : 0.96;
    utterance.pitch = 1.0;

    // Pick best matching regional voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      let match = null;
      if (activeVoiceLang === 'ml') {
        match = voices.find(v => v.lang === 'ml-IN' || v.lang.toLowerCase().startsWith('ml'));
        if (!match) match = voices.find(v => v.name.toLowerCase().includes('malayalam'));
        if (!match) match = voices.find(v => v.lang === 'hi-IN' || v.lang.includes('IN'));
      } else {
        match = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
      }
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  // Speech-to-Text Recognition Setup
  const startListening = (onFinalTranscript) => {
    setVoiceError(null);
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(
        activeVoiceLang === 'ml'
          ? 'ഈ ബ്രൗസറിൽ മലയാളം വോയ്‌സ് റെക്കഗ്നിഷൻ ലഭ്യമല്ല. ദയവായി Google Chrome അല്ലെങ്കിൽ Edge ഉപയോഗിക്കുക.'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = activeVoiceLang === 'ml' ? 'ml-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        const currentText = final || interim;
        setInputText(currentText);
        setLatestVoiceQuery(currentText);

        if (final && onFinalTranscript) {
          onFinalTranscript(final.trim());
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError(
            language === 'ml'
              ? 'മൈക്രോഫോൺ അനുമതി ലഭിച്ചില്ല. ബ്രൗസറിൽ മൈക്ക് അനുവദിക്കുക.'
              : 'Microphone permission was denied. Please allow microphone access.'
          );
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((finalText) => {
        if (finalText) {
          handleSendMessage(finalText);
        }
      });
    }
  };

  // Toggle Hands-Free Interactive Voice Mode
  const toggleVoiceMode = () => {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);
    stopSpeaking();
    stopListening();

    if (nextMode) {
      // Greet user in voice mode in fluent spoken Malayalam and start listening
      const greeting = activeVoiceLang === 'ml'
        ? 'നമസ്കാരം! ഞാൻ അഗ്രോറൈസ് കിസാൻ മിത്രം മലയാളം വോയ്‌സ് അസിസ്റ്റന്റ്. വിളകളെക്കുറിച്ചോ രോഗങ്ങളെക്കുറിച്ചോ വളപ്രയോഗത്തെക്കുറിച്ചോ സംശയങ്ങൾ ചോദിക്കൂ, ഞാൻ പറഞ്ഞുതരാം.'
        : 'Namaskaram! I am AgroRise Kisan Mitra voice assistant. Speak your agricultural query.';
      
      setLatestVoiceAnswer(greeting);
      speakMessage(greeting, 'voice-intro', () => {
        // Automatically start listening after greeting
        startListening((spokenQuery) => {
          if (spokenQuery) {
            handleSendMessage(spokenQuery);
          }
        });
      });
    }
  };

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setLatestVoiceQuery(query);
    stopSpeaking();
    stopListening();

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
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      // Auto-detect Malayalam script or active voice language
      const hasMalayalamScript = /[\u0D00-\u0D7F]/.test(query);
      const queryLanguage = (hasMalayalamScript || activeVoiceLang === 'ml' || language === 'ml') ? 'ml' : 'en';

      const response = await chatApi.sendMessage(query, historyPayload, queryLanguage);

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply || (language === 'ml' ? 'ക്ഷമിക്കണം, കൃത്യമായ മറുപടി ലഭ്യമല്ല.' : 'Sorry, could not retrieve a response.'),
        sources: response.sources || [],
        grounded: response.grounded_by_rag,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      setLatestVoiceAnswer(botReply.text);

      // Auto-speak response if enabled or in voice mode
      if (autoSpeak || isVoiceMode) {
        speakMessage(botReply.text, botReply.id, () => {
          // If in Voice Mode, prompt and re-listen for continuous dialogue
          if (isVoiceMode) {
            setTimeout(() => {
              startListening((nextQuery) => {
                if (nextQuery) {
                  handleSendMessage(nextQuery);
                }
              });
            }, 600);
          }
        });
      }
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
      setLatestVoiceAnswer(errorReply.text);
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
    stopSpeaking();
    stopListening();
    setMessages([]);
    setLatestVoiceQuery('');
    setLatestVoiceAnswer('');
  };

  // Helper to render text with bold & bullet formatting
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <div className="bot-formatted-content">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '6px' }} />;

          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const clean = trimmed.replace(/^[\*\-•]\s*/, '');
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            const clean = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(clean) }} />
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  // Interactive Malayalam Voice Assistant Screen
  const voiceModeScreen = (
    <div className="agro-voice-mode-screen">
      <div className="voice-mode-top">
        <div className="voice-mode-badge">
          <span className="live-dot" />
          <span>{activeVoiceLang === 'ml' ? '🎙️ കിസാൻ മിത്രം മലയാളം വോയ്‌സ് അസിസ്റ്റന്റ്' : '🎙️ Live Agronomic Voice Assistant'}</span>
        </div>
        <button
          type="button"
          className="btn-exit-voice-mode"
          onClick={() => {
            stopSpeaking();
            stopListening();
            setIsVoiceMode(false);
          }}
          title={t.exitVoiceMode || 'Switch to Text'}
        >
          ⌨️ {language === 'ml' ? 'ടെക്സ്റ്റ് ചാറ്റിലേക്ക് മടങ്ങാം' : 'Switch to Text'}
        </button>
      </div>

      {/* Central Visualizer Orb */}
      <div className="voice-orb-container">
        <div 
          className={`voice-orb ${isListening ? 'listening' : ''} ${isLoading ? 'thinking' : ''} ${speakingMessageId ? 'speaking' : ''}`}
          onClick={() => {
            if (speakingMessageId) {
              stopSpeaking();
            } else if (isListening) {
              stopListening();
            } else {
              startListening((spokenQuery) => {
                if (spokenQuery) handleSendMessage(spokenQuery);
              });
            }
          }}
          title="Click to speak or pause"
        >
          <div className="voice-orb-inner">
            {isLoading ? '🌾' : speakingMessageId ? '🔊' : isListening ? '🎙️' : '🌱'}
          </div>
          <div className="orb-wave ring-1" />
          <div className="orb-wave ring-2" />
          <div className="orb-wave ring-3" />
        </div>

        {/* Live Status Label */}
        <div className="voice-status-text">
          {isLoading ? (
            <span className="status-label thinking-color">
              {activeVoiceLang === 'ml' ? '🤔 കിസാൻ മിത്രം ആലോചിക്കുന്നു...' : '🤔 Kisan Mitra is analyzing...'}
            </span>
          ) : speakingMessageId ? (
            <span className="status-label speaking-color">
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
              <span className="equalizer-bar" />
              {activeVoiceLang === 'ml' ? '🔊 മലയാളത്തിൽ മറുപടി പറയുന്നു...' : '🔊 Speaking agricultural advice...'}
            </span>
          ) : isListening ? (
            <span className="status-label listening-color">
              🔴 {activeVoiceLang === 'ml' ? 'ശ്രദ്ധിക്കുന്നു... സംശയങ്ങൾ മലയാളത്തിൽ പറയൂ' : 'Listening... Speak your query'}
            </span>
          ) : (
            <span className="status-label idle-color">
              {activeVoiceLang === 'ml' ? 'സംസാരിക്കാൻ ഓർബിൽ അമർത്തുക' : 'Tap Orb to Speak'}
            </span>
          )}
        </div>
      </div>

      {/* Real-time Subtitles / Dialog Cards */}
      <div className="voice-dialog-display">
        {latestVoiceQuery && (
          <div className="voice-query-pill">
            <span className="query-tag">👤 {activeVoiceLang === 'ml' ? 'നിങ്ങൾ ചോദിച്ചത്:' : 'You Asked:'}</span>
            <p className="query-text">"{latestVoiceQuery}"</p>
          </div>
        )}

        {latestVoiceAnswer && (
          <div className="voice-answer-card">
            <div className="answer-badge">
              <span>🌾 കിസാൻ മിത്രം (Kisan Mitra AI)</span>
              {speakingMessageId && (
                <button type="button" className="stop-speech-mini-btn" onClick={stopSpeaking}>
                  ⏹️ {activeVoiceLang === 'ml' ? 'ശബ്ദം നിർത്തുക' : 'Stop Audio'}
                </button>
              )}
            </div>
            <div className="voice-answer-scroll">
              {renderFormattedText(latestVoiceAnswer)}
            </div>
          </div>
        )}

        {/* Quick Malayalam Voice Suggestion Chips if no query yet */}
        {!latestVoiceQuery && activeVoiceLang === 'ml' && (
          <div className="voice-quick-prompts-row">
            <span className="voice-prompt-lbl">ചോദിച്ചുനോക്കൂ:</span>
            <button type="button" className="voice-prompt-chip" onClick={() => handleSendMessage('കുരുമുളകിലെ ദ്രുതവാട്ടം തടയാൻ എന്ത് ചെയ്യണം?')}>
              🌶️ കുരുമുളകിലെ ദ്രുതവാട്ടം
            </button>
            <button type="button" className="voice-prompt-chip" onClick={() => handleSendMessage('തെങ്ങിലെ കൊമ്പൻ ചെല്ലിയെ എങ്ങനെ തുരത്താം?')}>
              🥥 കൊമ്പൻ ചെല്ലി പരിഹാരം
            </button>
            <button type="button" className="voice-prompt-chip" onClick={() => handleSendMessage('റബ്ബറിന്റെയും നെല്ലിന്റെയും നിലവിലെ താങ്ങുവില എത്ര?')}>
              💰 നെല്ല് &amp; റബ്ബർ താങ്ങുവില
            </button>
          </div>
        )}
      </div>

      {/* Voice Controls Bar */}
      <div className="voice-mode-controls">
        <button
          type="button"
          className={`voice-action-circle-btn ${isListening ? 'active-red' : ''}`}
          onClick={() => {
            if (isListening) stopListening();
            else startListening((query) => { if (query) handleSendMessage(query); });
          }}
          title={isListening ? 'Stop' : 'Speak'}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>

        {/* Voice Language Selector */}
        <div className="voice-lang-switch-box">
          <button
            type="button"
            className={`voice-lang-chip-btn ${activeVoiceLang === 'ml' ? 'active' : ''}`}
            onClick={() => {
              setActiveVoiceLang('ml');
              stopSpeaking();
            }}
          >
            🇮🇳 മലയാളം വോയ്‌സ്
          </button>
          <button
            type="button"
            className={`voice-lang-chip-btn ${activeVoiceLang === 'en' ? 'active' : ''}`}
            onClick={() => {
              setActiveVoiceLang('en');
              stopSpeaking();
            }}
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  );

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
          {/* Voice Mode Toggle Button */}
          <button
            type="button"
            className={`header-voice-mode-btn ${isVoiceMode ? 'active' : ''}`}
            onClick={toggleVoiceMode}
            title={isVoiceMode ? (t.exitVoiceMode || 'Switch to Text') : (t.startVoiceMode || 'Start Voice Chat')}
          >
            <span>🎙️</span>
            <span className="btn-voice-text">{isVoiceMode ? 'Text' : 'Voice'}</span>
          </button>

          {/* Auto-Speak Toggle */}
          <button
            type="button"
            className={`header-icon-btn ${autoSpeak ? 'active-sound' : ''}`}
            onClick={() => {
              if (speakingMessageId) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            title={autoSpeak ? (language === 'ml' ? 'ശബ്ദ മറുപടി ഓൺ' : 'Auto-Speak ON') : (language === 'ml' ? 'ശബ്ദ മറുപടി ഓഫ്' : 'Auto-Speak OFF')}
          >
            {autoSpeak ? '🔊' : '🔇'}
          </button>

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
                stopSpeaking();
                stopListening();
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

      {/* Body: Voice Mode Screen OR Text Messages Stream */}
      {isVoiceMode ? (
        voiceModeScreen
      ) : (
        <>
          <div className="agro-chat-stream">
            {voiceError && (
              <div className="voice-error-banner">
                <span>⚠️ {voiceError}</span>
                <button type="button" onClick={() => setVoiceError(null)}>✕</button>
              </div>
            )}

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
                    <>
                      {renderFormattedText(msg.text)}

                      {/* Listen to Voice Answer Button */}
                      <div className="bot-message-voice-bar">
                        <button
                          type="button"
                          className={`btn-msg-listen ${speakingMessageId === msg.id ? 'speaking' : ''}`}
                          onClick={() => {
                            if (speakingMessageId === msg.id) {
                              stopSpeaking();
                            } else {
                              speakMessage(msg.text, msg.id);
                            }
                          }}
                          title={speakingMessageId === msg.id ? (t.stopSpeaking || 'Stop Speaking') : (t.speakAnswer || 'Listen to Answer')}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <span className="sound-wave-icon">
                                <span className="wave-bar" />
                                <span className="wave-bar" />
                                <span className="wave-bar" />
                              </span>
                              <span>{language === 'ml' ? 'നിർത്തുക' : 'Stop'}</span>
                            </>
                          ) : (
                            <>
                              <span>🔊</span>
                              <span>{language === 'ml' ? 'ശബ്ദത്തിൽ കേൾക്കാം' : 'Listen'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="rag-sources-pill" title="Information grounded with verified agricultural literature">
                          <span className="rag-pill-icon">🏛️</span>
                          <span className="rag-pill-text">
                            {language === 'ml' ? 'ആധാരം: ' : 'Verified Source: '}
                            {msg.sources.join(' • ')}
                          </span>
                        </div>
                      )}
                    </>
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

          {/* Input Footer with Microphone Button */}
          <div className="agro-chat-footer">
            {isListening && (
              <div className="listening-banner-bar">
                <span className="listening-beacon" />
                <span className="listening-text">
                  {language === 'ml' ? 'ശ്രദ്ധിക്കുന്നു... സംശയങ്ങൾ പറയൂ (Malayalam)' : 'Listening in English... Speak your query'}
                </span>
                <button type="button" className="btn-stop-mic-bar" onClick={stopListening}>
                  {language === 'ml' ? 'പൂർത്തിയായി' : 'Done'}
                </button>
              </div>
            )}

            <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              {/* Mic Speech-to-Text Button */}
              <button
                type="button"
                className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={isListening ? (language === 'ml' ? 'മൈക്ക് നിർത്തുക' : 'Stop Listening') : (language === 'ml' ? 'ശബ്ദത്തിലൂടെ ചോദിക്കാം (Mic)' : 'Speak your query')}
              >
                {isListening ? (
                  <span className="mic-listening-pulse">🔴</span>
                ) : (
                  <span>🎙️</span>
                )}
              </button>

              <input
                ref={inputRef}
                type="text"
                className="chat-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? (t.voiceListening || 'Listening... Speak now') : (t.chatPlaceholder || 'Ask about crops, pests, soil, schemes...')}
                disabled={isLoading}
              />

              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputText.trim() || isLoading}
                title={t.chatSend || 'Send'}
              >
                <span>{t.chatSend || 'Send'}</span>
                <span>➤</span>
              </button>
            </form>
            <div className="chat-footer-note">
              Powered by Google Gemini AI • Bilingual Voice Q&amp;A
            </div>
          </div>
        </>
      )}
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
          title="Open Kisan Mitra AI Voice & Chat Assistant"
        >
          <div className="fab-avatar-badge">
            🎙️
            <span className="fab-pulse-dot" />
          </div>
          <span>{language === 'ml' ? '🎙️ മലയാളം വോയ്‌സ് അസിസ്റ്റന്റ്' : (t.tabChatbot || 'AI Kisan Mitra')}</span>
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
