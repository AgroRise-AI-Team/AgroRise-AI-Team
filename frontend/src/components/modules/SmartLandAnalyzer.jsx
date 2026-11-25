import React, { useState, useEffect } from 'react';
import { smartLandAnalyzerApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KERALA_DISTRICTS, DEFAULT_DISTRICT_PROFILES } from '../../constants/enums';
import LeafletLocationPicker from '../common/LeafletLocationPicker';


export default function SmartLandAnalyzer() {
  const { user, language, t } = useAuth();

  // Mode: 'simple' (Farmer-friendly, fast) vs 'detailed' (Soil-test & scientific)
  const [inputMode, setInputMode] = useState('simple');

  // Form State
  const [district, setDistrict] = useState(user?.profile?.district || 'Kozhikode');
  const [landArea, setLandArea] = useState(user?.profile?.land_area || 20);
  const [landAreaUnit, setLandAreaUnit] = useState(user?.profile?.land_area_unit || 'CENTS');
  const [landSlope, setLandSlope] = useState('GENTLE');
  const [sunlight, setSunlight] = useState('GOOD');
  const [waterAvailability, setWaterAvailability] = useState(user?.profile?.water_availability || 'MEDIUM');
  const [waterSource, setWaterSource] = useState(user?.profile?.primary_water_source || 'OPEN_WELL');
  const [season, setSeason] = useState('MUNDAKAN');
  const [budget, setBudget] = useState(user?.profile?.cultivation_budget || 15000);

  // Soil Properties State
  const [soilType, setSoilType] = useState('LATERITE');
  const [soilTypeConfirmed, setSoilTypeConfirmed] = useState(true);
  const [hasSoilTest, setHasSoilTest] = useState(false);

  // Soil Test Values with individual Unknown checkboxes
  const [soilTestValues, setSoilTestValues] = useState({
    ph: '',
    phUnknown: true,
    nitrogen: '',
    nitrogenUnknown: true,
    phosphorus: '',
    phosphorusUnknown: true,
    potassium: '',
    potassiumUnknown: true,
    organicCarbon: '',
    organicCarbonUnknown: true,
    ec: '',
    ecUnknown: true
  });

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null); // Starts NULL on initial load: only calculated on user request
  const [districtProfiles, setDistrictProfiles] = useState(DEFAULT_DISTRICT_PROFILES || {});
  const [selectedCropFilter, setSelectedCropFilter] = useState('all'); // 'all', 'signature', 'high_return', 'short_duration'

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // When districtProfiles metadata loads on mount, set defaults for the initial district
  useEffect(() => {
    const prof = districtProfiles[district] || DEFAULT_DISTRICT_PROFILES[district];
    if (prof) {
      applyDistrictDefaults(prof, district, false);
    }
  }, [districtProfiles]);

  const fetchMetadata = async () => {
    try {
      const meta = await smartLandAnalyzerApi.getMetadata();
      if (meta?.district_profiles) {
        setDistrictProfiles(prev => ({ ...prev, ...meta.district_profiles }));
      }
    } catch (e) {
      console.warn('Metadata fetch fallback:', e);
    }
  };

  const applyDistrictDefaults = (prof, targetDist = null, triggerRun = false) => {
    if (!prof) return;
    const distToUse = targetDist || district;
    const recSoil = prof.recommended_soil || 'LATERITE';
    const recSlope = prof.typical_slope || 'GENTLE';
    const recWater = prof.typical_water || 'MEDIUM';
    const recWaterSrc = prof.typical_water_source || 'OPEN_WELL';
    const recSun = prof.typical_sunlight || 'GOOD';

    setSoilType(recSoil);
    setLandSlope(recSlope);
    setWaterAvailability(recWater);
    setWaterSource(recWaterSrc);
    setSunlight(recSun);
    setSoilTypeConfirmed(true);

    if (triggerRun) {
      handleRunAnalysis(null, {
        district: distToUse,
        soilType: recSoil,
        landSlope: recSlope,
        waterAvailability: recWater,
        waterSource: recWaterSrc,
        sunlight: recSun,
        soilTypeConfirmed: true
      });
    }
  };

  // Centralized district change handler: instantly sets state, clears stale analysis, and re-analyzes
  const handleDistrictChange = (newDistrict, autoRun = true) => {
    setDistrict(newDistrict);
    setAnalysisResult(null); // Clear previous district analysis immediately!

    const prof = districtProfiles[newDistrict] || DEFAULT_DISTRICT_PROFILES[newDistrict];
    if (prof) {
      applyDistrictDefaults(prof, newDistrict, autoRun);
    } else if (autoRun) {
      handleRunAnalysis(null, { district: newDistrict });
    }
  };

  // Note: We do NOT auto-run on initial mount anymore. Analysis only runs when user clicks submit or loads a preset.


  const handleRunAnalysis = async (e, overrideData = {}) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const activeDistrict = overrideData.district || district;
    const activeSoil = overrideData.soilType || soilType;
    const activeSlope = overrideData.landSlope || landSlope;
    const activeWater = overrideData.waterAvailability || waterAvailability;
    const activeWaterSource = overrideData.waterSource || waterSource;
    const activeSunlight = overrideData.sunlight || sunlight;
    const activeSoilConfirmed = overrideData.soilTypeConfirmed !== undefined
      ? overrideData.soilTypeConfirmed
      : soilTypeConfirmed;

    const soilPayload = {};
    if (hasSoilTest) {
      soilPayload.ph = soilTestValues.phUnknown || !soilTestValues.ph ? 'UNKNOWN' : parseFloat(soilTestValues.ph);
      soilPayload.nitrogen = soilTestValues.nitrogenUnknown || !soilTestValues.nitrogen ? 'UNKNOWN' : parseFloat(soilTestValues.nitrogen);
      soilPayload.phosphorus = soilTestValues.phosphorusUnknown || !soilTestValues.phosphorus ? 'UNKNOWN' : parseFloat(soilTestValues.phosphorus);
      soilPayload.potassium = soilTestValues.potassiumUnknown || !soilTestValues.potassium ? 'UNKNOWN' : parseFloat(soilTestValues.potassium);
      soilPayload.organic_carbon = soilTestValues.organicCarbonUnknown || !soilTestValues.organicCarbon ? 'UNKNOWN' : parseFloat(soilTestValues.organicCarbon);
      soilPayload.ec = soilTestValues.ecUnknown || !soilTestValues.ec ? 'UNKNOWN' : parseFloat(soilTestValues.ec);
    }

    const payload = {
      district: activeDistrict,
      land_area: parseFloat(landArea) || 20,
      land_area_unit: landAreaUnit,
      soil_type: activeSoil,
      soil_type_confirmed: activeSoilConfirmed,
      has_soil_test: hasSoilTest,
      soil_test_values: soilPayload,
      water_availability: activeWater,
      water_source: activeWaterSource,
      sunlight: activeSunlight,
      land_slope: activeSlope,
      season,
      budget: parseFloat(budget) || 15000
    };

    try {
      const response = await smartLandAnalyzerApi.analyze(payload);
      if (response && response.status === 'success') {
        setAnalysisResult(response);
      } else {
        throw new Error(response?.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Land Analysis Error:', err);
      setError(err.message || 'Failed to analyze land parameters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader
  const handleLoadPreset = (preset) => {
    setDistrict(preset.district);
    setLandArea(preset.land_area);
    setLandAreaUnit(preset.land_area_unit);
    setBudget(preset.budget);
    setSeason(preset.season);
    setSoilType(preset.soil_type);
    setSoilTypeConfirmed(preset.soil_type_confirmed);
    setWaterAvailability(preset.water_availability);
    setWaterSource(preset.water_source);
    setSunlight(preset.sunlight);
    setLandSlope(preset.land_slope);
    setHasSoilTest(false);
    setAnalysisResult(null); // Clear stale analysis

    handleRunAnalysis(null, {
      district: preset.district,
      soilType: preset.soil_type,
      landSlope: preset.land_slope,
      waterAvailability: preset.water_availability,
      waterSource: preset.water_source,
      sunlight: preset.sunlight,
      soilTypeConfirmed: preset.soil_type_confirmed
    });
  };

  // Only accept analysisResult if it strictly matches the currently selected district!
  const isCurrentAnalysis = analysisResult && (
    (analysisResult.location_intelligence?.district && analysisResult.location_intelligence.district.toLowerCase() === district.toLowerCase()) ||
    (analysisResult.input_summary?.district && analysisResult.input_summary.district.toLowerCase() === district.toLowerCase()) ||
    (analysisResult.analysis_metadata?.district && analysisResult.analysis_metadata.district.toLowerCase() === district.toLowerCase())
  );
  const activeAnalysis = isCurrentAnalysis ? analysisResult : null;

  // Current location intelligence strictly for the currently selected district!
  const currentLocIntel = (
    (activeAnalysis?.location_intelligence?.district?.toLowerCase() === district.toLowerCase())
      ? activeAnalysis.location_intelligence
      : (districtProfiles[district] || DEFAULT_DISTRICT_PROFILES[district] || {})
  );

  // Filter crops
  const getFilteredCrops = () => {
    if (!activeAnalysis?.ranked_crops) return [];
    let list = [...activeAnalysis.ranked_crops];
    if (selectedCropFilter === 'signature') {
      return list.filter(c => c.is_signature_culture);
    }
    if (selectedCropFilter === 'high_return') {
      return list.sort((a, b) => b.financials.roi_percentage - a.financials.roi_percentage);
    }
    if (selectedCropFilter === 'short_duration') {
      return list.filter(c => c.duration_days <= 120);
    }
    return list;
  };

  const filteredCrops = getFilteredCrops();
  const topCrop = activeAnalysis?.ranked_crops?.[0];

  return (
    <div className="smart-land-analyzer-container" style={{ padding: '20px 24px', maxWidth: '1380px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* ========================================================= */}
      {/* 1. Header Banner & Quick Presets */}
      {/* ========================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0b592b 0%, #166534 50%, #1b4332 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(11, 89, 43, 0.16)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              <span>🌱 {language === 'ml' ? 'സ്മാർട്ട് ലാൻഡ് അനലൈസർ' : 'Module 2 • Smart Land Analyzer'}</span>
              <span>•</span>
              <span>Kerala Krishi AI</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              {language === 'ml' ? '🌾 കൃഷിഭൂമി പരിശോധനയും അനുയോജ്യ വിള നിർദ്ദേശവും' : '🌾 Location-Smart Land & Culture Recommender'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.92, maxWidth: '760px', lineHeight: 1.4 }}>
              {language === 'ml'
                ? 'നിങ്ങളുടെ ജില്ലയും കൃഷിയിടത്തിന്റെ വിവരങ്ങളും നൽകി ഏറ്റവും അനുയോജ്യമായ വിളകളും ലാഭസാധ്യതകളും കണ്ടെത്തുക.'
                : 'Select your district to instantly discover the perfect agricultural cultures suited to your local soil, terrain, water, and budget.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '4px',
            borderRadius: '12px',
            display: 'flex',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setInputMode('simple')}
              style={{
                background: inputMode === 'simple' ? '#ffffff' : 'transparent',
                color: inputMode === 'simple' ? '#0b592b' : '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {language === 'ml' ? '⚡ ലളിതമായ ഫോം' : '🚀 Simple Mode (Fast)'}
            </button>
            <button
              type="button"
              onClick={() => setInputMode('detailed')}
              style={{
                background: inputMode === 'detailed' ? '#ffffff' : 'transparent',
                color: inputMode === 'detailed' ? '#0b592b' : '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {language === 'ml' ? '🔬 വിശദമായ മണ്ണ് പരിശോധന' : '🔬 Advanced Soil-Test Mode'}
            </button>
          </div>
        </div>

        {/* 1-Click Quick Location Presets */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', opacity: '0.85', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ 1-Click Regional Demos:
          </span>
          <button
            type="button"
            onClick={() => handleLoadPreset({
              district: 'Kozhikode',
              land_area: 20,
              land_area_unit: 'CENTS',
              soil_type: 'LATERITE',
              soil_type_confirmed: true,
              water_availability: 'MEDIUM',
              water_source: 'OPEN_WELL',
              sunlight: 'GOOD',
              land_slope: 'GENTLE',
              season: 'MUNDAKAN',
              budget: 15000
            })}
            style={{
              background: district === 'Kozhikode' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: district === 'Kozhikode' ? '#0b592b' : '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📍 Kozhikode (20 Cents • Nendran/Coconut)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset({
              district: 'Palakkad',
              land_area: 1,
              land_area_unit: 'ACRES',
              soil_type: 'BLACK_COTTON',
              soil_type_confirmed: true,
              water_availability: 'HIGH',
              water_source: 'CANAL_RIVER',
              sunlight: 'GOOD',
              land_slope: 'FLAT',
              season: 'MUNDAKAN',
              budget: 45000
            })}
            style={{
              background: district === 'Palakkad' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: district === 'Palakkad' ? '#0b592b' : '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📍 Palakkad (1 Acre • Paddy/Sugarcane)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset({
              district: 'Wayanad',
              land_area: 50,
              land_area_unit: 'CENTS',
              soil_type: 'FOREST_LOAM',
              soil_type_confirmed: true,
              water_availability: 'HIGH',
              water_source: 'OPEN_WELL',
              sunlight: 'PARTIAL',
              land_slope: 'MODERATE',
              season: 'ALL_SEASON',
              budget: 25000
            })}
            style={{
              background: district === 'Wayanad' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: district === 'Wayanad' ? '#0b592b' : '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📍 Wayanad (50 Cents • Spices/Coffee)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset({
              district: 'Alappuzha',
              land_area: 1,
              land_area_unit: 'ACRES',
              soil_type: 'CLAYEY_KOLE',
              soil_type_confirmed: true,
              water_availability: 'HIGH',
              water_source: 'CANAL_RIVER',
              sunlight: 'GOOD',
              land_slope: 'FLAT',
              season: 'PUNCHA',
              budget: 45000
            })}
            style={{
              background: district === 'Alappuzha' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: district === 'Alappuzha' ? '#0b592b' : '#ffffff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📍 Alappuzha (1 Acre • Kuttanad Rice)
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Main Two-Column Layout */}
      {/* ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>

        {/* --------------------------------------------------------- */}
        {/* LEFT COLUMN: Input Form */}
        {/* --------------------------------------------------------- */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🗺️ Farm & Land Inputs
            </h2>
            <span style={{
              fontSize: '0.74rem',
              background: inputMode === 'simple' ? '#e0f2fe' : '#fef3c7',
              color: inputMode === 'simple' ? '#0369a1' : '#b45309',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              {inputMode === 'simple' ? '⚡ Simple Mode' : '🔬 Detailed Mode'}
            </span>
          </div>

          <form onSubmit={(e) => handleRunAnalysis(e)}>

            {/* 1. Primary Location Selector (District) */}
            <div style={{
              background: '#f8fafc',
              border: '2px solid #cbd5e1',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#0b592b', marginBottom: '6px' }}>
                📍 Select District / Location (ജില്ല)
              </label>
              <select
                value={district}
                onChange={(e) => {
                  handleDistrictChange(e.target.value, true);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #94a3b8',
                  fontSize: '0.96rem',
                  fontWeight: '700',
                  background: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Instant Location Intelligence Mini-Banner */}
              {currentLocIntel && (
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>
                    🏛️ {currentLocIntel.zone || currentLocIntel.agro_climatic_zone}
                  </div>
                  {currentLocIntel.signature_crops && (
                    <div style={{ marginTop: '4px', color: '#166534' }}>
                      🌾 <strong>Signature Cultures:</strong> {currentLocIntel.signature_crops.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Location & Nearby Agricultural Centers */}
            <LeafletLocationPicker
              selectedDistrict={district}
              onSelectDistrict={(newDist) => {
                handleDistrictChange(newDist, true);
              }}
            />


            {/* 2. Land Area & Unit */}
            <div style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  📐 Land Area (വിസ്തീർണം)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  placeholder="e.g. 20"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Unit
                </label>
                <select
                  value={landAreaUnit}
                  onChange={(e) => setLandAreaUnit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#f8fafc'
                  }}
                >
                  <option value="CENTS">Cents (സെന്റ്)</option>
                  <option value="ACRES">Acres (ഏക്കർ)</option>
                  <option value="HECTARES">Hectares (ഹെക്ടർ)</option>
                </select>
              </div>
            </div>

            {/* 3. Budget */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                💰 Available Budget (ലഭ്യമായ ബജറ്റ് - ₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#64748b', fontWeight: '700' }}>₹</span>
                <input
                  type="number"
                  step="500"
                  min="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 15000"
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 24px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>

            {/* 4. Water Availability */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                💧 Water Availability (ജലലഭ്യത)
              </label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  background: '#f8fafc'
                }}
              >
                <option value="HIGH">🟢 High - Abundant Year-Round Water</option>
                <option value="MEDIUM">🟡 Medium - Seasonal / Adequate Water</option>
                <option value="LOW">🟠 Low - Limited Water (Requires Drip/Mulch)</option>
                <option value="SCARCE">🔴 Scarce - Drought Prone / Rainfed</option>
              </select>
            </div>

            {/* 5. Sunlight Exposure */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                ☀️ Sunlight Exposure (സൂര്യപ്രകാശം)
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  background: '#f8fafc'
                }}
              >
                <option value="GOOD">☀️ Good / Full Sun (&gt;6 hrs - Paddy/Banana)</option>
                <option value="PARTIAL">⛅ Partial Shade (3-5 hrs - Ginger/Turmeric)</option>
                <option value="SHADE">☁️ Heavy Shade (&lt;3 hrs - Cardamom/Mushrooms)</option>
              </select>
            </div>

            {/* ----------------------------------------------------- */}
            {/* Simple Mode vs Detailed Mode Controls */}
            {/* ----------------------------------------------------- */}
            {inputMode === 'simple' ? (
              /* Simple Mode: Shows summary of auto-configured soil/slope with an edit trigger */
              <div style={{
                background: '#f0fdf4',
                border: '1px dashed #86efac',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#166534' }}>⚡ Regional Soil & Terrain Pre-configured:</span>
                  <button
                    type="button"
                    onClick={() => setInputMode('detailed')}
                    style={{ background: 'none', border: 'none', color: '#0b592b', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.74rem' }}
                  >
                    Change / Test Soil
                  </button>
                </div>
                <div style={{ color: '#334155' }}>
                  • Soil: <strong>{soilType.replace('_', ' ')}</strong> (Auto-detected for {district})<br />
                  • Slope: <strong>{landSlope}</strong> • Season: <strong>{season}</strong>
                </div>
              </div>
            ) : (
              /* Detailed Mode: Full inputs for Slope, Water Source, Season, Soil Type & Soil Test */
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '16px' }}>
                
                {/* Land Slope */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    ⛰️ Land Slope (ഭൂമിയുടെ ചരിവ്)
                  </label>
                  <select
                    value={landSlope}
                    onChange={(e) => setLandSlope(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="FLAT">Flat / Plain (0 - 3%)</option>
                    <option value="GENTLE">Gentle Slope (3 - 10%)</option>
                    <option value="MODERATE">Moderate Slope (10 - 25%)</option>
                    <option value="STEEP">Steep / Hilly (&gt;25%)</option>
                  </select>
                </div>

                {/* Season */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    🗓️ Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="MUNDAKAN">Mundakan (രണ്ടാംവിള: Oct - Jan/Feb)</option>
                    <option value="VIRIPPU">Virippu (ഒന്നാംവിള: May - Sep)</option>
                    <option value="PUNCHA">Puncha (വേനൽക്കാലം: Jan - Apr)</option>
                    <option value="ALL_SEASON">All Season / Perennial (വാർഷികം)</option>
                  </select>
                </div>

                {/* Soil Type */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    🧪 Soil Type (മണ്ണിന്റെ തരം)
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="LATERITE">Laterite Soil (ചെങ്കൽ മണ്ണ്)</option>
                    <option value="BLACK_COTTON">Black Cotton Soil (കറുത്ത മണ്ണ് - ചിറ്റൂർ)</option>
                    <option value="ALLUVIAL">Coastal / Riverine Alluvium (എക്കൽ മണ്ണ്)</option>
                    <option value="CLAYEY_KOLE">Clayey / Kari / Kole (കോൾ / കരി മണ്ണ്)</option>
                    <option value="RED_LOAM">Red Loam (ചുവന്ന പശിമരാശി)</option>
                    <option value="SANDY_LOAM">Sandy Loam (മണൽ കലർന്ന പശിമരാശി)</option>
                    <option value="FOREST_LOAM">Forest Loam (വനമണ്ണ് - വയനാട്/ഇടുക്കി)</option>
                    <option value="UNKNOWN">❓ Unknown / Untested</option>
                  </select>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#475569', marginTop: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={soilTypeConfirmed}
                      onChange={(e) => setSoilTypeConfirmed(e.target.checked)}
                    />
                    <span>Soil type confirmed on-site (not assumed from location)</span>
                  </label>
                </div>

                {/* Soil Test Report Toggle */}
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasSoilTest}
                      onChange={(e) => setHasSoilTest(e.target.checked)}
                    />
                    <span>📋 Enter Lab Soil Test Values (pH & N-P-K)</span>
                  </label>

                  {hasSoilTest && (
                    <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#475569' }}>pH</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 6.0"
                          value={soilTestValues.ph}
                          onChange={(e) => setSoilTestValues({ ...soilTestValues, ph: e.target.value, phUnknown: false })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#475569' }}>Nitrogen (N)</span>
                        <input
                          type="number"
                          placeholder="kg/ha"
                          value={soilTestValues.nitrogen}
                          onChange={(e) => setSoilTestValues({ ...soilTestValues, nitrogen: e.target.value, nitrogenUnknown: false })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#94a3b8' : '#0b592b',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.96rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(11, 89, 43, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <span className="module-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                  <span>Analyzing Location with AI/ML...</span>
                </>
              ) : (
                <>
                  <span>🔍 Suggest Perfect Cultures for {district}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT COLUMN: AI/ML Results & Perfect Cultures Spotlight */}
        {/* --------------------------------------------------------- */}
        <div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <strong>⚠️ Error: </strong> {error}
            </div>
          )}

          {/* Location Intelligence Spotlight Card */}
          {currentLocIntel && (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              borderRadius: '16px',
              border: '2px solid #86efac',
              padding: '18px 22px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(22, 101, 52, 0.06)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#166534', fontWeight: '800' }}>
                    📍 Location Intelligence & Agro-Climatic Zone
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                    {district} ({currentLocIntel.zone_ml || 'കാർഷിക മേഖല'})
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {currentLocIntel.climate_description || currentLocIntel.zone}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>Confidence</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '900', color: (activeAnalysis?.analysis_metadata?.confidence_score || 85) >= 80 ? '#15803d' : '#b45309' }}>
                    {activeAnalysis?.analysis_metadata?.confidence_score || 85}%
                  </div>
                </div>
              </div>

              {/* Signature Cultures Chips */}
              {currentLocIntel.signature_crops && currentLocIntel.signature_crops.length > 0 && (
                <div style={{ borderTop: '1px dashed #bbf7d0', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    🌟 Iconic Cultures Historically Thriving in {district}:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {currentLocIntel.signature_crops.map((sig, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #86efac',
                          color: '#0b592b',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        ✓ {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMPTY STATE: Shown until user clicks Analyze or auto-runs */}
          {!activeAnalysis && !loading && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              padding: '44px 28px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗺️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                സ്ഥലവിവരങ്ങൾ നൽകിയ ശേഷം അനുയോജ്യമായ വിളകൾ കാണാം
              </h3>
              <p style={{ margin: '0 auto 18px auto', maxWidth: '460px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                ഇടതുവശത്ത് നിങ്ങളുടെ ജില്ല, സ്ഥലവിസ്തീർണം, ബജറ്റ് എന്നിവ നൽകി <strong>'Suggest Perfect Cultures'</strong> ക്ലിക്ക് ചെയ്യുക.
                (Select your district, land area, and budget on the left, then click the button to see ranked suitable crops and reasons.)
              </p>
            </div>
          )}

          {/* Missing Information Alerts */}
          {activeAnalysis?.missing_information && activeAnalysis.missing_information.length > 0 && (
            <div style={{
              background: '#fffdf5',
              borderRadius: '14px',
              border: '1px solid #fef08a',
              padding: '14px 18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <strong style={{ fontSize: '0.9rem', color: '#854d0e' }}>
                  Notice for {district}: Missing Soil Information
                </strong>
              </div>
              {activeAnalysis.missing_information.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', color: '#713f12', lineHeight: 1.45, marginBottom: '6px' }}>
                  • <strong>{item.field}:</strong> {item.impact} <br />
                  <span style={{ color: '#15803d', fontWeight: '600' }}>💡 Action: {item.recommendation}</span>
                </div>
              ))}
            </div>
          )}

          {/* TOP RECOMMENDATION CROWN SHOWCASE */}
          {topCrop && (
            <div style={{
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              color: '#ffffff',
              borderRadius: '18px',
              padding: '22px 24px',
              marginBottom: '22px',
              boxShadow: '0 8px 24px rgba(22, 101, 52, 0.22)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '24px',
                background: '#facc15',
                color: '#854d0e',
                fontWeight: '900',
                fontSize: '0.74rem',
                padding: '4px 12px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                🏆 #1 BEST CULTURE FOR {district.toUpperCase()}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px 0' }}>
                    {topCrop.crop_name}
                  </h3>
                  <div style={{ fontSize: '0.94rem', opacity: 0.95, fontWeight: '600', color: '#bbf7d0' }}>
                    {topCrop.malayalam_name} • <span style={{ opacity: 0.85 }}>{topCrop.category} • {topCrop.duration_days} Days</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  padding: '8px 18px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>Suitability</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
                    {topCrop.suitability_percentage}%
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                background: 'rgba(0,0,0,0.18)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '14px',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>Cost ({topCrop.financials.area_in_cents} Cents)</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>₹{topCrop.financials.estimated_cost_inr.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>Expected Yield</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{topCrop.financials.expected_yield_kg.toLocaleString()} kg</div>
                </div>
                <div>
                  <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>Estimated Profit</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#facc15' }}>₹{topCrop.financials.net_profit_estimate_inr.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ opacity: 0.8, fontSize: '0.72rem' }}>Est. Return</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#86efac' }}>+{topCrop.financials.roi_percentage}% ROI</div>
                </div>
              </div>

              {/* Reasons */}
              <div style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                <strong style={{ color: '#facc15' }}>💡 Why this is the perfect culture for your land:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', opacity: 0.95 }}>
                  {topCrop.reasons.map((r, rIdx) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Filter Tabs for All Crops */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🌾 All Suitable Cultures for {district} ({filteredCrops.length})
            </h3>

            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedCropFilter('all')}
                style={{
                  background: selectedCropFilter === 'all' ? '#ffffff' : 'transparent',
                  color: selectedCropFilter === 'all' ? '#0b592b' : '#64748b',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                All Crops
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropFilter('signature')}
                style={{
                  background: selectedCropFilter === 'signature' ? '#ffffff' : 'transparent',
                  color: selectedCropFilter === 'signature' ? '#0b592b' : '#64748b',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🌟 {district} Signatures
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropFilter('high_return')}
                style={{
                  background: selectedCropFilter === 'high_return' ? '#ffffff' : 'transparent',
                  color: selectedCropFilter === 'high_return' ? '#0b592b' : '#64748b',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Highest ROI %
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropFilter('short_duration')}
                style={{
                  background: selectedCropFilter === 'short_duration' ? '#ffffff' : 'transparent',
                  color: selectedCropFilter === 'short_duration' ? '#0b592b' : '#64748b',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ≤90 Days
              </button>
            </div>
          </div>

          {/* Other Crops List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredCrops.slice(topCrop ? 1 : 0).map((crop) => {
              const fin = crop.financials;

              return (
                <div
                  key={crop.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '800', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '6px' }}>
                          #{crop.rank}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                          {crop.crop_name}
                        </h4>
                        {crop.is_signature_culture && (
                          <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                            🌟 {district} Signature
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: '600', marginTop: '2px' }}>
                        {crop.malayalam_name} • <span style={{ color: '#64748b' }}>{crop.category} • {crop.duration_days} days</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>Suitability</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803d' }}>
                        {crop.suitability_percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Financial Stats Bar */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Estimated Cost:</span>
                      <strong style={{ display: 'block', color: '#0f172a' }}>₹{fin.estimated_cost_inr.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Expected Yield:</span>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{fin.expected_yield_kg} kg</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Net Profit:</span>
                      <strong style={{ display: 'block', color: '#166534' }}>₹{fin.net_profit_estimate_inr.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>ROI:</span>
                      <strong style={{ display: 'block', color: '#0b592b' }}>+{fin.roi_percentage}%</strong>
                    </div>
                  </div>

                  {/* Reasons */}
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                    {crop.reasons.slice(0, 2).map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
