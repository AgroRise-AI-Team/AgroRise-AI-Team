import React, { useState, useEffect, useMemo } from 'react';
import { newsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DICTIONARY = {
  en: {
    liveTag: 'Gemini AI Agricultural Intelligence',
    updated: 'Updated',
    title: '🌱 Real-Time Agricultural News & Farmer Advisories',
    subtitle: 'Live farming news scanned & analyzed by AI to extract market trends, MSP updates, weather warnings, and direct actionable advice.',
    refreshBtn: 'Refresh AI Feeds',
    refreshing: 'Analyzing Live Feeds...',
    searchPlaceholder: 'Search by crop, pest, district, or topic...',
    impactLabel: 'Impact:',
    all: 'All',
    highImpact: '🔴 High',
    mediumImpact: '🟡 Medium',
    allImpact: 'All',
    positive: '🟢 Positive',
    caution: '⚠️ Caution',
    neutral: 'ℹ️ Neutral',
    aiTakeaway: 'AI Farmer Takeaway:',
    actionAdvice: 'Recommended Farmer Action:',
    readSource: 'Read Source Article ↗',
    noNews: 'No agricultural news found matching your search criteria.',
    scanning: 'Scanning latest agricultural news and generating AI farmer advisories...',
    tryAgain: 'Try Again',
    categories: [
      { id: 'All', label: 'All Categories' },
      { id: 'Weather & Monsoons', label: '🌦️ Weather & Monsoons' },
      { id: 'MSP & Market Rates', label: '💰 MSP & Market Rates' },
      { id: 'Government Schemes & Subsidies', label: '🏛️ Schemes & Subsidies' },
      { id: 'Pest & Crop Disease', label: '🐛 Pest & Disease' },
      { id: 'Market & Export Trends', label: '📈 Market & Exports' }
    ]
  },
  ml: {
    liveTag: 'ജെമിനി എ.ഐ കാർഷിക വിവരങ്ങൾ',
    updated: 'പുതുക്കിയത്',
    title: '🌱 തത്സമയ കാർഷിക വാർത്തകളും കർഷക നിർദ്ദേശങ്ങളും',
    subtitle: 'തത്സമയ വാർത്തകൾ എ.ഐ വിശകലനം ചെയ്ത് തയ്യാറാക്കിയ വിപണി വിവരങ്ങൾ, താങ്ങുവില, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, കർഷകർ ചെയ്യേണ്ട കാര്യങ്ങൾ.',
    refreshBtn: 'വിവരങ്ങൾ പുതുക്കുക',
    refreshing: 'വാർത്തകൾ വിശകലനം ചെയ്യുന്നു...',
    searchPlaceholder: 'വിളകൾ, കീടങ്ങൾ, ജില്ല, വിഷയം എന്നിവ തിരയുക...',
    impactLabel: 'മുൻഗണന:',
    all: 'എല്ലാം',
    highImpact: '🔴 പ്രധാനം',
    mediumImpact: '🟡 ഇടത്തരം',
    allImpact: 'എല്ലാം',
    positive: '🟢 ആശ്വാസകരം',
    caution: '⚠️ ജാഗ്രത',
    neutral: 'ℹ️ വിവരം',
    aiTakeaway: 'എ.ഐ കർഷക സംഗ്രഹം:',
    actionAdvice: 'കർഷകർ ഉടൻ ചെയ്യേണ്ട കാര്യങ്ങൾ:',
    readSource: 'മുഴുവൻ വാർത്ത വായിക്കുക ↗',
    noNews: 'തിരഞ്ഞെടുത്ത വിഷയത്തിൽ വാർത്തകൾ ലഭ്യമല്ല.',
    scanning: 'കാർഷിക വാർത്തകൾ പരിശോധിച്ച് എ.ഐ കർഷക നിർദ്ദേശങ്ങൾ തയ്യാറാക്കുന്നു...',
    tryAgain: 'വീണ്ടും ശ്രമിക്കുക',
    categories: [
      { id: 'All', label: 'എല്ലാ വിഭാഗങ്ങളും' },
      { id: 'Weather & Monsoons', label: '🌦️ കാലാവസ്ഥയും മഴയും' },
      { id: 'MSP & Market Rates', label: '💰 താങ്ങുവിലയും വിപണിയും' },
      { id: 'Government Schemes & Subsidies', label: '🏛️ സബ്‌സിഡികളും പദ്ധതികളും' },
      { id: 'Pest & Crop Disease', label: '🐛 കീടങ്ങളും രോഗങ്ങളും' },
      { id: 'Market & Export Trends', label: '📈 വിപണിയും കയറ്റുമതിയും' }
    ]
  }
};

export default function AgriNewsSection() {
  const { language: lang, setLanguage: setLang } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImpact, setSelectedImpact] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedImpact]);

  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedImpact !== 'ALL') params.impact = selectedImpact;
      if (forceRefresh) params.refresh = 'true';

      const data = await newsApi.getLatestNews(params);
      setArticles(data.articles || []);
      if (data.last_updated) setLastUpdated(data.last_updated);
    } catch (err) {
      console.error('Error fetching agricultural news:', err);
      setError('Unable to load latest agricultural news.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchNews(true);
  };

  // Filter articles based on search query across both English and Malayalam fields
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(item => {
      const title = (item.title || '').toLowerCase();
      const titleMl = (item.title_ml || '').toLowerCase();
      const summary = (item.farmer_summary || '').toLowerCase();
      const summaryMl = (item.farmer_summary_ml || '').toLowerCase();
      const crops = (item.affected_crops || []).join(' ').toLowerCase();
      const cropsMl = (item.affected_crops_ml || []).join(' ').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      return (
        title.includes(q) ||
        titleMl.includes(q) ||
        summary.includes(q) ||
        summaryMl.includes(q) ||
        crops.includes(q) ||
        cropsMl.includes(q) ||
        cat.includes(q)
      );
    });
  }, [articles, searchQuery]);

  return (
    <section className="agri-news-section" style={styles.section}>
      {/* Top Bar with Language Selector & Pulse */}
      <div style={styles.topBar}>
        <div style={styles.badgeRow}>
          <span style={styles.livePulse}></span>
          <span style={styles.badgeText}>{t.liveTag}</span>
          {lastUpdated && <span style={styles.lastUpdatedText}>• {t.updated} {lastUpdated}</span>}
        </div>

        {/* Language Switcher Buttons */}
        <div style={styles.langSwitchContainer}>
          <button
            onClick={() => setLang('ml')}
            style={{
              ...styles.langBtn,
              ...(lang === 'ml' ? styles.langBtnActive : {})
            }}
          >
            🇮🇳 മലയാളം
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              ...styles.langBtn,
              ...(lang === 'en' ? styles.langBtnActive : {})
            }}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{t.title}</h2>
          <p style={styles.subtitle}>{t.subtitle}</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{
            ...styles.refreshBtn,
            opacity: refreshing ? 0.7 : 1,
            cursor: refreshing ? 'not-allowed' : 'pointer'
          }}
          title="Force fresh AI analysis from live feeds"
        >
          <span
            style={{
              display: 'inline-block',
              transform: refreshing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.8s ease'
            }}
          >
            🔄
          </span>
          {refreshing ? t.refreshing : t.refreshBtn}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.filterSection}>
        {/* Search Input */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={styles.categoryPills}>
          {t.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                ...styles.categoryPill,
                ...(selectedCategory === cat.id ? styles.categoryPillActive : {})
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Impact Level Pills */}
        <div style={styles.impactFilters}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>{t.impactLabel}</span>
          <button
            onClick={() => setSelectedImpact('ALL')}
            style={{
              ...styles.impactPill,
              ...(selectedImpact === 'ALL' ? styles.impactPillActive : {})
            }}
          >
            {t.allImpact}
          </button>
          <button
            onClick={() => setSelectedImpact('HIGH')}
            style={{
              ...styles.impactPill,
              ...(selectedImpact === 'HIGH' ? styles.impactPillActive : {})
            }}
          >
            {t.highImpact}
          </button>
          <button
            onClick={() => setSelectedImpact('MEDIUM')}
            style={{
              ...styles.impactPill,
              ...(selectedImpact === 'MEDIUM' ? styles.impactPillActive : {})
            }}
          >
            {t.mediumImpact}
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div style={styles.stateBox}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '14px', color: '#374151', fontWeight: 600 }}>{t.scanning}</p>
        </div>
      ) : error ? (
        <div style={{ ...styles.stateBox, borderColor: '#fca5a5', background: '#fff1f2' }}>
          <p style={{ color: '#b91c1c', fontWeight: 600 }}>⚠️ {error}</p>
          <button onClick={() => fetchNews(false)} style={styles.retryBtn}>
            {t.tryAgain}
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div style={styles.stateBox}>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{t.noNews}</p>
        </div>
      ) : (
        <div style={styles.newsGrid}>
          {filteredArticles.map((item, idx) => {
            const displayTitle = lang === 'ml' && item.title_ml ? item.title_ml : item.title;
            const displayCategory = lang === 'ml' && item.category_ml ? item.category_ml : item.category;
            const displaySummary = lang === 'ml' && item.farmer_summary_ml ? item.farmer_summary_ml : item.farmer_summary;
            const displayAdvice = lang === 'ml' && item.action_advice_ml ? item.action_advice_ml : item.action_advice;
            const displayCrops = lang === 'ml' && item.affected_crops_ml?.length ? item.affected_crops_ml : item.affected_crops;
            const displayImpact = lang === 'ml' && item.impact_level_ml ? item.impact_level_ml : `${item.impact_level} IMPACT`;

            const isHigh = item.impact_level === 'HIGH';
            const isMedium = item.impact_level === 'MEDIUM';

            return (
              <div
                key={item.id || idx}
                style={{
                  ...styles.card,
                  borderColor: isHigh ? '#fecaca' : isMedium ? '#fef08a' : '#e5e7eb'
                }}
              >
                {/* Meta Header */}
                <div style={styles.cardMeta}>
                  <span style={styles.sourceTag}>🏛️ {item.source}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {/* Impact Badge */}
                    <span
                      style={{
                        ...styles.badge,
                        ...(isHigh ? styles.impactHigh : isMedium ? styles.impactMedium : styles.impactLow)
                      }}
                    >
                      {displayImpact}
                    </span>
                    {/* Sentiment Badge */}
                    <span
                      style={{
                        ...styles.badge,
                        ...(item.sentiment === 'POSITIVE'
                          ? styles.sentimentPos
                          : item.sentiment === 'CAUTION'
                          ? styles.sentimentCaution
                          : styles.sentimentNeutral)
                      }}
                    >
                      {item.sentiment === 'POSITIVE' ? t.positive : item.sentiment === 'CAUTION' ? t.caution : t.neutral}
                    </span>
                  </div>
                </div>

                {/* News Title */}
                <h3 style={styles.cardTitle}>{displayTitle}</h3>

                {/* Tags Row */}
                <div style={styles.tagsRow}>
                  <span style={styles.categoryBadge}>📁 {displayCategory}</span>
                  {displayCrops && displayCrops.map((crop, cIdx) => (
                    <span key={cIdx} style={styles.cropBadge}>🌾 {crop}</span>
                  ))}
                </div>

                {/* AI Farmer Takeaway Box */}
                <div style={styles.aiInsightBox}>
                  <div style={styles.insightHeader}>
                    <span style={{ fontSize: '1.15rem' }}>💡</span>
                    <span style={styles.insightHeaderText}>{t.aiTakeaway}</span>
                  </div>
                  <p style={styles.summaryText}>{displaySummary}</p>

                  {/* Recommended Action Box */}
                  {displayAdvice && (
                    <div style={styles.actionAdviceBox}>
                      <strong style={{ color: '#065f46', fontSize: '0.86rem', display: 'block', marginBottom: '2px' }}>
                        🚜 {t.actionAdvice}
                      </strong>
                      <span style={{ color: '#047857', fontSize: '0.88rem', lineHeight: '1.45', display: 'block' }}>
                        {displayAdvice}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.publishedText}>🕒 {item.published_at}</span>
                  {item.link && item.link !== '#' && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.readMoreLink}
                    >
                      {t.readSource}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    margin: '32px 0',
    padding: '28px 24px',
    background: '#ffffff',
    borderRadius: '18px',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  livePulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.25)',
    display: 'inline-block'
  },
  badgeText: {
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#059669',
    background: '#ecfdf5',
    padding: '3px 10px',
    borderRadius: '8px'
  },
  lastUpdatedText: {
    fontSize: '0.78rem',
    color: '#6b7280'
  },
  langSwitchContainer: {
    display: 'flex',
    background: '#f3f4f6',
    padding: '3px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb'
  },
  langBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#4b5563',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  langBtnActive: {
    background: '#ffffff',
    color: '#047857',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    fontWeight: 700
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 6px 0'
  },
  subtitle: {
    fontSize: '0.94rem',
    color: '#4b5563',
    maxWidth: '820px',
    margin: 0,
    lineHeight: 1.5
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: '#047857',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 700,
    boxShadow: '0 3px 10px rgba(4, 120, 87, 0.28)',
    transition: 'all 0.2s ease'
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    paddingBottom: '20px',
    marginBottom: '24px',
    borderBottom: '1px solid #f3f4f6'
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '550px',
    width: '100%'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.95rem',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 36px',
    borderRadius: '10px',
    border: '1.5px solid #d1d5db',
    fontSize: '0.88rem',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px'
  },
  categoryPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  categoryPill: {
    padding: '7px 15px',
    borderRadius: '24px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#374151',
    fontSize: '0.84rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  categoryPillActive: {
    background: '#047857',
    color: '#ffffff',
    borderColor: '#047857',
    fontWeight: 700,
    boxShadow: '0 2px 6px rgba(4, 120, 87, 0.2)'
  },
  impactFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  impactPill: {
    padding: '5px 12px',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#4b5563'
  },
  impactPillActive: {
    background: '#111827',
    color: '#ffffff',
    borderColor: '#111827',
    fontWeight: 700
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    borderRadius: '16px',
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sourceTag: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#4b5563'
  },
  badge: {
    fontSize: '0.74rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px'
  },
  impactHigh: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  impactMedium: {
    background: '#fef3c7',
    color: '#92400e'
  },
  impactLow: {
    background: '#e0f2fe',
    color: '#075985'
  },
  sentimentPos: {
    background: '#dcfce7',
    color: '#166534'
  },
  sentimentCaution: {
    background: '#ffedd5',
    color: '#9a3412'
  },
  sentimentNeutral: {
    background: '#f3f4f6',
    color: '#374151'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 12px 0',
    lineHeight: 1.45
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px'
  },
  categoryBadge: {
    fontSize: '0.76rem',
    background: '#f3f4f6',
    color: '#374151',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 600
  },
  cropBadge: {
    fontSize: '0.76rem',
    background: '#ecfdf5',
    color: '#065f46',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 700
  },
  aiInsightBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
    flex: 1
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  insightHeaderText: {
    fontSize: '0.84rem',
    fontWeight: 800,
    color: '#1e293b',
    letterSpacing: '0.3px'
  },
  summaryText: {
    fontSize: '0.9rem',
    color: '#334155',
    margin: '0 0 12px 0',
    lineHeight: 1.55
  },
  actionAdviceBox: {
    background: '#ecfdf5',
    borderLeft: '4px solid #059669',
    padding: '10px 12px',
    borderRadius: '6px'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '14px',
    marginTop: 'auto'
  },
  publishedText: {
    fontSize: '0.78rem',
    color: '#9ca3af'
  },
  readMoreLink: {
    fontSize: '0.86rem',
    fontWeight: 700,
    color: '#047857',
    textDecoration: 'none'
  },
  stateBox: {
    textAlign: 'center',
    padding: '40px 20px',
    borderRadius: '14px',
    background: '#f9fafb',
    border: '1px dashed #d1d5db'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3.5px solid #e5e7eb',
    borderTop: '3.5px solid #047857',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite'
  },
  retryBtn: {
    marginTop: '12px',
    padding: '8px 16px',
    background: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
