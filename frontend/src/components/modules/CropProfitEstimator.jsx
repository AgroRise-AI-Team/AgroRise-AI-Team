import React, { useState, useEffect } from 'react';
import { cropProfitEstimatorApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KERALA_DISTRICTS } from '../../constants/enums';
import LeafletLocationPicker from '../common/LeafletLocationPicker';


export default function CropProfitEstimator() {
  const { user, language, t } = useAuth();

  // Form State - Starts empty until user enters data
  const [selectedCrop, setSelectedCrop] = useState('');
  const [district, setDistrict] = useState(user?.profile?.district || '');
  const [landArea, setLandArea] = useState('');
  const [landAreaUnit, setLandAreaUnit] = useState('CENTS');
  const [customPrice, setCustomPrice] = useState('');

  // Itemized Expenses - Starts completely blank
  const [expenses, setExpenses] = useState({
    planting_material: '',
    fertiliser: '',
    labour: '',
    irrigation: '',
    transport: '',
    other_expenses: ''
  });

  // Crops Metadata from server
  const [cropsList, setCropsList] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null); // NULL on initial load: only populated on user submit
  const [error, setError] = useState(null);

  // Saved Estimates (localStorage)
  const [savedEstimates, setSavedEstimates] = useState(() => {
    try {
      const saved = localStorage.getItem('agrorise_saved_profit_estimates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch crops metadata on mount (options for dropdown only)
  useEffect(() => {
    fetchCropsMetadata();
  }, []);

  const fetchCropsMetadata = async () => {
    setLoadingCrops(true);
    try {
      const data = await cropProfitEstimatorApi.getCrops();
      if (data?.crops) {
        setCropsList(data.crops);
      }
    } catch (e) {
      console.warn('Failed to fetch crops metadata:', e);
    } finally {
      setLoadingCrops(false);
    }
  };

  // Convert area to cents
  const getAreaInCents = () => {
    const val = parseFloat(landArea) || 0;
    if (landAreaUnit === 'ACRES') return val * 100;
    if (landAreaUnit === 'HECTARES') return val * 247.1;
    return val;
  };

  // Optional manual 1-click helper: user clicks if they want KAU benchmark suggestions
  const handleAutoFillStandardRates = () => {
    if (!selectedCrop) {
      setError('Please select a crop first to load standard rates.');
      return;
    }
    const cropMeta = cropsList.find(c => c.id === selectedCrop);
    if (!cropMeta) return;

    const areaCents = getAreaInCents() || 20; // fallback to 20 if area not yet typed
    if (!landArea) {
      setLandArea(20);
    }
    const defaults = cropMeta.default_expenses_per_cent;

    setExpenses({
      planting_material: Math.round(defaults.planting_material * areaCents),
      fertiliser: Math.round(defaults.fertiliser * areaCents),
      labour: Math.round(defaults.labour * areaCents),
      irrigation: Math.round(defaults.irrigation * areaCents),
      transport: Math.round(defaults.transport * areaCents),
      other_expenses: Math.round(defaults.other_expenses * areaCents)
    });

    setCustomPrice(cropMeta.selling_price_per_kg_inr.medium);
    setError(null);
  };

  // Run calculation ONLY when user clicks the submit button
  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!selectedCrop) {
      setError('ദയവായി ഒരു വിള തിരഞ്ഞെടുക്കുക (Please select a crop).');
      return;
    }
    if (!landArea || parseFloat(landArea) <= 0) {
      setError('ദയവായി ഭൂമിയുടെ വിസ്തീർണം നൽകുക (Please enter a valid land area).');
      return;
    }
    if (!district) {
      setError('ദയവായി ജില്ല തിരഞ്ഞെടുക്കുക (Please select a district).');
      return;
    }

    setCalculating(true);

    const payload = {
      crop_id: selectedCrop,
      land_area: parseFloat(landArea),
      land_area_unit: landAreaUnit,
      district: district,
      custom_expenses: {
        planting_material: expenses.planting_material !== '' ? parseFloat(expenses.planting_material) : null,
        fertiliser: expenses.fertiliser !== '' ? parseFloat(expenses.fertiliser) : null,
        labour: expenses.labour !== '' ? parseFloat(expenses.labour) : null,
        irrigation: expenses.irrigation !== '' ? parseFloat(expenses.irrigation) : null,
        transport: expenses.transport !== '' ? parseFloat(expenses.transport) : null,
        other_expenses: expenses.other_expenses !== '' ? parseFloat(expenses.other_expenses) : null
      },
      custom_price: customPrice !== '' ? parseFloat(customPrice) : null
    };

    try {
      const res = await cropProfitEstimatorApi.calculateProfit(payload);
      if (res && res.status === 'success') {
        setResult(res);
      } else {
        throw new Error(res?.message || 'Calculation failed');
      }
    } catch (err) {
      console.error('Profit calculation error:', err);
      setError(err.message || 'Failed to estimate profit. Please verify your inputs.');
    } finally {
      setCalculating(false);
    }
  };

  // Reset all inputs
  const handleResetForm = () => {
    setSelectedCrop('');
    setLandArea('');
    setCustomPrice('');
    setExpenses({
      planting_material: '',
      fertiliser: '',
      labour: '',
      irrigation: '',
      transport: '',
      other_expenses: ''
    });
    setResult(null);
    setError(null);
  };

  // Save current estimate to LocalStorage
  const handleSaveEstimate = () => {
    if (!result) return;
    const newEntry = {
      id: Date.now(),
      cropName: result.crop_info.name,
      district: district,
      area: `${landArea} ${landAreaUnit}`,
      totalCost: result.cost_breakdown.total_cost,
      expectedProfit: result.scenarios.medium.estimated_profit,
      lowProfit: result.scenarios.low.estimated_profit,
      highProfit: result.scenarios.high.estimated_profit,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const updated = [newEntry, ...savedEstimates.slice(0, 7)];
    setSavedEstimates(updated);
    try {
      localStorage.setItem('agrorise_saved_profit_estimates', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteSaved = (id) => {
    const updated = savedEstimates.filter(item => item.id !== id);
    setSavedEstimates(updated);
    try {
      localStorage.setItem('agrorise_saved_profit_estimates', JSON.stringify(updated));
    } catch {}
  };

  const activeCropMeta = cropsList.find(c => c.id === selectedCrop);

  return (
    <div className="crop-profit-estimator-container">
      
      {/* 1. Header Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #064e3b 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: '22px',
        boxShadow: '0 8px 24px rgba(6, 95, 70, 0.16)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.18)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              <span>💰 Module 4 • Crop Profit Estimator</span>
              <span>•</span>
              <span>No Auto-Fill Defaults</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              {language === 'ml' ? '📊 വിള ഉൽപ്പാദനച്ചെലവും ലാഭ / നഷ്ട സാധ്യതയും' : '📊 Cultivation Cost, Yield & Profit / Loss Forecaster'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.92, maxWidth: '780px', lineHeight: 1.45 }}>
              {language === 'ml' 
                ? 'നിങ്ങളുടെ കൃഷിയിടത്തിന്റെ വിവരങ്ങളും ചെലവുകളും നൽകുക. കണക്കുകൂട്ടലുകൾ നൽകിയ ശേഷമേ കൃത്യമായ ഫലങ്ങൾ ലഭ്യമാകൂ.'
                : 'Enter your farm details and expenses. Projections will calculate only after you submit.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedCrop && (
              <button
                type="button"
                onClick={handleAutoFillStandardRates}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>⚡ Auto-fill KAU Benchmark Rates</span>
              </button>
            )}

            {(selectedCrop || landArea || result) && (
              <button
                type="button"
                onClick={handleResetForm}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ========================================================= */}
        {/* LEFT COLUMN: Input Form */}
        {/* ========================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '22px 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              🌾 Cultivation Parameters
            </h2>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Enter your values</span>
          </div>

          <form onSubmit={handleCalculate}>

            {/* 1. Crop Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                🌱 Select Crop / Plant Type (വിള തിരഞ്ഞെടുക്കുക) *
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  background: '#f8fafc',
                  color: selectedCrop ? '#0f172a' : '#64748b'
                }}
                required
              >
                <option value="">-- Select Crop (വിള തിരഞ്ഞെടുക്കുക) --</option>
                <option value="nendran_banana">🍌 Nendran Banana (നേന്ത്രവാഴ)</option>
                <option value="paddy_wetland">🌾 Paddy / Rice (നെല്ല് - ഉമ / ജ്യോതി)</option>
                <option value="tapioca_cassava">🥔 Tapioca / Cassava (കപ്പ / മരച്ചീനി)</option>
                <option value="ginger">🫚 Ginger (ഇഞ്ചി - മാരൻ)</option>
                <option value="turmeric">✨ Turmeric (മഞ്ഞൾ - പ്രതിഭ)</option>
                <option value="black_pepper">🌿 Black Pepper (കുരുമുളക് - പന്നിയൂർ)</option>
                <option value="vegetables_cowpea_bhindi">🥗 Vegetables (പയർ & വെണ്ട)</option>
                <option value="sugarcane_commercial">🎋 Sugarcane (കരിമ്പ് - ചിറ്റൂർ)</option>
              </select>
            </div>

            {/* 2. District / Location & Land Area */}
            <div style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                  📍 District (ജില്ല) *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#f8fafc',
                    color: district ? '#0f172a' : '#64748b'
                  }}
                  required
                >
                  <option value="">-- Select District --</option>
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '5px' }}>
                  📐 Land Area *
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="e.g. 20"
                    style={{
                      width: '60%',
                      padding: '8px 8px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <select
                    value={landAreaUnit}
                    onChange={(e) => setLandAreaUnit(e.target.value)}
                    style={{
                      width: '40%',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      background: '#f8fafc'
                    }}
                  >
                    <option value="CENTS">Cents</option>
                    <option value="ACRES">Acres</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Location & Nearby Centers */}
            <LeafletLocationPicker
              selectedDistrict={district || 'Kozhikode'}
              onSelectDistrict={(newDist) => setDistrict(newDist)}
            />


            {/* 3. Expected Selling Price */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                  🏷️ Expected Selling Price (₹/kg or unit)
                </label>
                {activeCropMeta && (
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>
                    Standard: ₹{activeCropMeta.selling_price_per_kg_inr.medium}/kg
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#64748b', fontWeight: '700' }}>₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={activeCropMeta ? `e.g. ${activeCropMeta.selling_price_per_kg_inr.medium}` : 'e.g. 38'}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 24px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 4. Expenditure Breakdown */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
                  🧾 Expenditure Breakdown (₹)
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Enter your costs or leave blank for KAU defaults
                </span>
              </div>

              {/* Planting Material */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>🌱 Planting Material (വിത്ത് / തൈകൾ)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Cost of seeds/suckers"
                  value={expenses.planting_material}
                  onChange={(e) => setExpenses({ ...expenses, planting_material: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Fertiliser & Manure */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>🧪 Fertiliser & Manure (വളം & കുമ്മായം)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Cost of manure/lime/fertilizer"
                  value={expenses.fertiliser}
                  onChange={(e) => setExpenses({ ...expenses, fertiliser: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Labour Charges */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>👨‍🌾 Labour Charges (കൂലിച്ചെലവ്)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Tilling, planting & harvesting labour"
                  value={expenses.labour}
                  onChange={(e) => setExpenses({ ...expenses, labour: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Irrigation & Water */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>💧 Irrigation & Fuel (നന & വൈദ്യുതി)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Pumping/electricity cost"
                  value={expenses.irrigation}
                  onChange={(e) => setExpenses({ ...expenses, irrigation: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Transport to Market */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>🚚 Transport to Market (ചരക്കുകൂലി)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Vehicle/mandi transport"
                  value={expenses.transport}
                  onChange={(e) => setExpenses({ ...expenses, transport: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Other Expenses */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                  <span>🛡️ Other Expenses (താങ്ങ്, കീടനിയന്ത്രണം)</span>
                </div>
                <input
                  type="number"
                  placeholder="₹ Crop protection, fencing, stakes"
                  value={expenses.other_expenses}
                  onChange={(e) => setExpenses({ ...expenses, other_expenses: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              disabled={calculating}
              style={{
                width: '100%',
                background: calculating ? '#94a3b8' : '#065f46',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.96rem',
                fontWeight: '800',
                cursor: calculating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(6, 95, 70, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {calculating ? (
                <>
                  <span className="module-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                  <span>Calculating Profit & Loss...</span>
                </>
              ) : (
                <>
                  <span>📊 Calculate Profit & Scenarios</span>
                </>
              )}
            </button>
          </form>

          {/* Saved Estimates List */}
          {savedEstimates.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                📁 Saved Estimates ({savedEstimates.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {savedEstimates.map(item => (
                  <div key={item.id} style={{
                    background: '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <strong>{item.cropName}</strong> ({item.area} in {item.district})<br />
                      <span style={{ color: item.expectedProfit >= 0 ? '#166534' : '#991b1b', fontWeight: '700' }}>
                        Exp. Profit: ₹{int(item.expectedProfit).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(item.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Results Only Appear After User Calculates */}
        {/* ========================================================= */}
        <div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <strong>⚠️ ശ്രദ്ധിക്കുക (Notice): </strong> {error}
            </div>
          )}

          {/* EMPTY STATE: Shown until user clicks calculate */}
          {!result && !calculating && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              padding: '48px 32px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3.2rem', marginBottom: '14px' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                വിവരങ്ങൾ നൽകിയ ശേഷം ലാഭക്കണക്ക് കാണാം
              </h3>
              <p style={{ margin: '0 auto 20px auto', maxWidth: '480px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                ഇടതുവശത്ത് നിങ്ങളുടെ വിള, സ്ഥലവിസ്തീർണം, ചെലവുകൾ എന്നിവ നൽകി <strong>'Calculate Profit & Scenarios'</strong> ക്ലിക്ക് ചെയ്യുക.
                (Enter your crop details and expenses on the left, then click Calculate to view projected profits, loss risks, and break-even points.)
              </p>

              <div style={{
                display: 'inline-grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                textAlign: 'left',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                maxWidth: '460px',
                width: '100%'
              }}>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>🔴 നഷ്ടസാധ്യത (Loss Risk)</strong>
                  <span style={{ fontSize: '0.74rem' }}>കാലാവസ്ഥാ വ്യതിയാനം വന്നാലുണ്ടാകുന്ന നഷ്ടം</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>🟢 പ്രതീക്ഷിക്കുന്ന ലാഭം</strong>
                  <span style={{ fontSize: '0.74rem' }}>സാധാരണ സീസണിലെ അറ്റാദായം</span>
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.82rem' }}>⚖️ Break-Even</strong>
                  <span style={{ fontSize: '0.74rem' }}>നഷ്ടം വരാതിരിക്കാനുള്ള കുറഞ്ഞ വില</span>
                </div>
              </div>
            </div>
          )}

          {/* CALCULATED RESULTS: Visible only when user has submitted data */}
          {result && (
            <>
              {/* Top Investment & Safety Banner */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '18px 22px',
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>
                    Cultivation Overview
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                    {result.crop_info.name} • {result.crop_info.land_area_cents} Cents
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Location: <strong>{result.location}</strong> • Cost per Cent: <strong>₹{result.cost_breakdown.cost_per_cent}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL COST</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>
                      ₹{result.cost_breakdown.total_cost.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveEstimate}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    💾 Save Estimate
                  </button>
                </div>
              </div>

              {/* Agronomic Reality & Sanity Check Alert */}
              {result.sanity_warnings && result.sanity_warnings.length > 0 && (
                <div style={{
                  background: '#fffbeb',
                  borderRadius: '14px',
                  border: '2px solid #fde68a',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <strong style={{ fontSize: '0.94rem', color: '#92400e' }}>
                      Agronomic Reality Check (കാർഷിക സാമ്പത്തിക പരിശോധന)
                    </strong>
                  </div>
                  {result.sanity_warnings.map((warn, wIdx) => (
                    <div key={wIdx} style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5, marginBottom: '6px' }}>
                      {warn}
                    </div>
                  ))}
                  <div style={{ fontSize: '0.76rem', color: '#b45309', marginTop: '6px', fontStyle: 'italic' }}>
                    💡 Tip: Click <strong>"⚡ Auto-fill KAU Benchmark Rates"</strong> on the left to see realistic Kerala Agricultural University costs.
                  </div>
                </div>
              )}


              {/* THREE SCENARIOS (Low, Medium, High) */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    🎯 Profit & Loss Scenarios
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Comparing Downside Risk vs Realistic vs Peak
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>

                  {/* 1. LOW SCENARIO */}
                  <div style={{
                    background: result.scenarios.low.is_loss ? '#fef2f2' : '#fffbeb',
                    border: `2px solid ${result.scenarios.low.is_loss ? '#fca5a5' : '#fde68a'}`,
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: result.scenarios.low.is_loss ? '#991b1b' : '#92400e',
                        background: result.scenarios.low.is_loss ? '#fee2e2' : '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        🔴 Conservative / Stress
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Adverse Weather</span>
                    </div>

                    <div style={{ fontSize: '1.45rem', fontWeight: '900', color: result.scenarios.low.is_loss ? '#b91c1c' : '#b45309', margin: '6px 0' }}>
                      {result.scenarios.low.status_text}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px' }}>
                      ROI: <strong>{result.scenarios.low.roi_percentage}%</strong>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px', fontSize: '0.76rem', color: '#334155' }}>
                      • Harvest Yield: <strong>{result.scenarios.low.expected_yield_kg} kg</strong><br />
                      • Price: <strong>₹{result.scenarios.low.selling_price_per_kg}/kg</strong><br />
                      • Revenue: <strong>₹{result.scenarios.low.gross_revenue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* 2. MEDIUM SCENARIO (Realistic) */}
                  <div style={{
                    background: '#f0fdf4',
                    border: '2px solid #22c55e',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 6px 16px rgba(34, 197, 94, 0.12)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      background: '#15803d',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '2px 10px',
                      borderRadius: '10px'
                    }}>
                      MOST LIKELY
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: '#15803d',
                        background: '#dcfce7',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        🟢 Realistic Baseline
                      </span>
                    </div>

                    <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#15803d', margin: '6px 0' }}>
                      {result.scenarios.medium.status_text}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '12px' }}>
                      ROI: <strong>+{result.scenarios.medium.roi_percentage}%</strong>
                    </div>

                    <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '10px', fontSize: '0.76rem', color: '#334155' }}>
                      • Harvest Yield: <strong>{result.scenarios.medium.expected_yield_kg} kg</strong><br />
                      • Price: <strong>₹{result.scenarios.medium.selling_price_per_kg}/kg</strong><br />
                      • Revenue: <strong>₹{result.scenarios.medium.gross_revenue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* 3. HIGH SCENARIO (Optimistic) */}
                  <div style={{
                    background: '#f0fdfa',
                    border: '2px solid #14b8a6',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: '#0f766e',
                        background: '#ccfbf1',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        🌟 Optimistic / Festive
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Peak Demand</span>
                    </div>

                    <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0f766e', margin: '6px 0' }}>
                      {result.scenarios.high.status_text}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#0f766e', marginBottom: '12px' }}>
                      ROI: <strong>+{result.scenarios.high.roi_percentage}%</strong>
                    </div>

                    <div style={{ borderTop: '1px solid #99f6e4', paddingTop: '10px', fontSize: '0.76rem', color: '#334155' }}>
                      • Harvest Yield: <strong>{result.scenarios.high.expected_yield_kg} kg</strong><br />
                      • Price: <strong>₹{result.scenarios.high.selling_price_per_kg}/kg</strong><br />
                      • Revenue: <strong>₹{result.scenarios.high.gross_revenue.toLocaleString()}</strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Break-Even & Risk Cushion Card */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px 22px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                  ⚖️ Break-Even & Safety Cushion (നഷ്ടം വരാതിരിക്കാനുള്ള പരിധി)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>BREAK-EVEN PRICE</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                      ₹{result.break_even.break_even_price_per_kg} / kg
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '600' }}>
                      Expected: ₹{result.break_even.market_price_realistic}/kg ({result.break_even.price_safety_margin_percentage}% cushion)
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>BREAK-EVEN YIELD</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                      {result.break_even.break_even_yield_kg} kg
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Minimum production needed
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                  💡 {result.break_even.guidance}
                </p>
              </div>

              {/* Weather & Climate Risk Advisory */}
              <div style={{
                background: '#eff6ff',
                borderRadius: '14px',
                border: '1px solid #bfdbfe',
                padding: '16px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.1rem' }}>🌦️</span>
                  <strong style={{ fontSize: '0.88rem', color: '#1e40af' }}>
                    Weather & Crop Protection Risk in {result.location}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                  {result.weather_risk_advisory}
                </p>
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
                {result.disclaimer}
              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

function int(val) {
  return Math.round(Number(val) || 0);
}
