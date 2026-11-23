import React, { useState, useEffect } from 'react';
import { agricultureApi } from '../../services/api';
import { KERALA_DISTRICTS } from '../../constants/enums';
import { useAuth } from '../../context/AuthContext';

export default function MainDashboard() {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithImages, setOnlyWithImages] = useState(false);

  // Selected image modal preview
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchAgricultureData();
  }, [selectedDistrict]);

  const fetchAgricultureData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedDistrict) params.district = selectedDistrict;
      const res = await agricultureApi.getFarmersAgricultureData(params);
      setFarmers(res.farmers || []);
    } catch (err) {
      console.error('Error fetching agriculture data:', err);
      setError(err.message || 'Failed to load agricultural data.');
    } finally {
      setLoading(false);
    }
  };

  // Filter in-memory for search query & image checkbox
  const filteredFarmers = farmers.filter(f => {
    if (onlyWithImages && !f.land_image_url) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (f.farmer_display_name || '').toLowerCase().includes(q);
      const matchUsername = (f.farmer_username || '').toLowerCase().includes(q);
      const matchCrop = (f.current_crop || '').toLowerCase().includes(q);
      const matchDist = (f.district || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchCrop && !matchDist) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalFarmers = farmers.length;
  const totalAcres = farmers.reduce((sum, f) => sum + (parseFloat(f.land_area) || 0), 0).toFixed(1);
  const farmersWithImages = farmers.filter(f => f.land_image_url).length;
  const uniqueCrops = Array.from(new Set(farmers.map(f => f.current_crop).filter(Boolean)));

  return (
    <div className="main-dashboard-container">
      {/* Hero Banner */}
      <section className="dashboard-hero-section">
        <div className="hero-text-block">
          <div className="hero-pill-badge">
            <span className="live-dot"></span> Visitors Access Portal • Kerala Krishi Network
          </div>
          <h1 className="hero-heading">🌾 Visitors Dashboard</h1>
          <p className="hero-subtext">
            Explore verified agricultural records, land cultivation profiles, soil reports, and field photographs uploaded directly by farmers across Kerala.
          </p>
          {user && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.84rem', marginTop: '6px' }}>
              <span>👋 Logged in as:</span>
              <strong style={{ color: '#ffffff' }}>{user.username}</strong>
              <span style={{ opacity: 0.85 }}>({user.profile?.role || 'VISITOR'} • {user.profile?.district || 'Kerala'})</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">👨‍🌾</span>
            <div className="stat-content">
              <span className="stat-num">{totalFarmers}</span>
              <span className="stat-lbl">Registered Farmers</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🌾</span>
            <div className="stat-content">
              <span className="stat-num">{totalAcres}</span>
              <span className="stat-lbl">Total Acres Farmed</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📸</span>
            <div className="stat-content">
              <span className="stat-num">{farmersWithImages}</span>
              <span className="stat-lbl">Field Photos Uploaded</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🌱</span>
            <div className="stat-content">
              <span className="stat-num">{uniqueCrops.length || 1}</span>
              <span className="stat-lbl">Active Crop Types</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="filter-controls-bar">
        <div className="filter-group-left">
          {/* Search box */}
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search farmer, crop, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dashboard-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* District select */}
          <div className="district-filter-wrapper">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="dashboard-filter-select"
            >
              <option value="">All Kerala Districts</option>
              {KERALA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-group-right">
          <label className="checkbox-filter-label">
            <input
              type="checkbox"
              checked={onlyWithImages}
              onChange={(e) => setOnlyWithImages(e.target.checked)}
            />
            <span>With Field Photos Only</span>
          </label>

          <button className="refresh-data-btn" onClick={fetchAgricultureData} title="Refresh farm records">
            🔄 Refresh
          </button>
        </div>
      </section>

      {/* Content Area */}
      {error && (
        <div className="dashboard-alert-error">
          <span>⚠️ {error}</span>
          <button onClick={fetchAgricultureData}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading-box">
          <div className="module-spinner"></div>
          <p>Loading farmer agricultural records from Kerala database...</p>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">🌾</div>
          <h3>No Farmer Agricultural Records Found</h3>
          <p>Try clearing your search query or selecting a different district filter.</p>
          <button 
            className="reset-filters-btn"
            onClick={() => { setSelectedDistrict(''); setSearchQuery(''); setOnlyWithImages(false); }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <section className="farmers-data-grid">
          {filteredFarmers.map(farmer => (
            <div key={farmer.id} className="farmer-data-card">
              {/* Card Header */}
              <div className="farmer-card-header">
                <div className="farmer-meta">
                  <div className="farmer-avatar-badge">
                    {farmer.farmer_display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="farmer-name">
                      {farmer.farmer_display_name}
                      {farmer.is_verified_farmer && (
                        <span className="verified-badge-tag" title="Verified Kerala Farmer">✓ Verified</span>
                      )}
                    </h3>
                    <span className="farmer-district-tag">
                      📍 {farmer.district} {farmer.panchayath_or_village ? `• ${farmer.panchayath_or_village}` : ''}
                    </span>
                  </div>
                </div>

                <span className="role-chip">{farmer.role}</span>
              </div>

              {/* Land Photo Banner if uploaded */}
              {farmer.land_image_url ? (
                <div 
                  className="land-photo-wrapper clickable"
                  onClick={() => setPreviewImage({ url: farmer.land_image_url, title: `${farmer.farmer_display_name}'s Land in ${farmer.district}` })}
                  title="Click to view full image"
                >
                  <img 
                    src={farmer.land_image_url} 
                    alt={`Land uploaded by ${farmer.farmer_display_name}`} 
                    className="land-photo-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="land-photo-overlay">
                    <span>🔍 View Field Photo</span>
                  </div>
                </div>
              ) : (
                <div className="land-photo-placeholder">
                  <span className="placeholder-icon">🌾</span>
                  <span className="placeholder-text">Field photo not yet uploaded by farmer</span>
                </div>
              )}

              {/* Agricultural Parameters Grid */}
              <div className="agri-specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Current Crop</span>
                  <span className="spec-value crop-highlight">
                    🌱 {farmer.current_crop}
                  </span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Growth Stage</span>
                  <span className="spec-value">
                    {farmer.growth_stage_display || farmer.growth_stage}
                  </span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Land Area</span>
                  <span className="spec-value">
                    📐 {farmer.land_area} {farmer.land_area_unit}
                  </span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Soil Type</span>
                  <span className="spec-value">
                    {farmer.soil_type_display || farmer.soil_type}
                  </span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Water Source</span>
                  <span className="spec-value">
                    💧 {farmer.primary_water_source_display || farmer.primary_water_source}
                  </span>
                </div>

                <div className="spec-item">
                  <span className="spec-label">Irrigation Method</span>
                  <span className="spec-value">
                    {farmer.irrigation_method_display || farmer.irrigation_method}
                  </span>
                </div>
              </div>

              {/* Products Listed if any */}
              {farmer.products && farmer.products.length > 0 && (
                <div className="farmer-products-section">
                  <span className="products-sec-title">📦 Produce Available:</span>
                  <div className="products-tag-row">
                    {farmer.products.map(p => (
                      <span key={p.id} className="product-pill">
                        {p.crop_name} ({p.quantity_available_kg} kg @ ₹{p.price_per_kg}/kg)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer info */}
              <div className="farmer-card-footer">
                <span className="update-timestamp">
                  Updated: {new Date(farmer.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="status-indicator">
                  <span className="dot-green"></span> Active Record
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div className="image-modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h4>{previewImage.title}</h4>
              <button className="close-modal-btn" onClick={() => setPreviewImage(null)}>✕</button>
            </div>
            <div className="image-modal-body">
              <img src={previewImage.url} alt={previewImage.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
