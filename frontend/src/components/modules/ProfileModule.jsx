import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, farmerApi } from '../../services/api';
import {
  GROWTH_STAGES,
  IRRIGATION_METHODS
} from '../../constants/enums';

export default function ProfileModule() {
  const { user, updateProfile } = useAuth();
  const profile = user?.profile || {};

  // Land details state fetched from backend endpoint
  const [landDetails, setLandDetails] = useState(null);
  const [loadingLand, setLoadingLand] = useState(false);

  // Profile fields state
  const [editProfile, setEditProfile] = useState({
    growth_stage: profile.growth_stage || 'VEGETATIVE',
    last_estimated_pest_risk: profile.last_estimated_pest_risk || 'MEDIUM',
    cultivation_budget: profile.cultivation_budget || '75000.00',
    historical_pest_issues: profile.historical_pest_issues || 'Stem borer',
    panchayath_or_village: profile.panchayath_or_village || 'Chittur',
    upi_id: profile.upi_id || 'suresh@oksbi',
    irrigation_method: profile.irrigation_method || 'FLOOD',
  });

  // File upload fields
  const [idDocFile, setIdDocFile] = useState(null);
  const [landImgFile, setLandImgFile] = useState(null);

  // Password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [passMsg, setPassMsg] = useState(null);
  const [profileMsg, setProfileMsg] = useState(null);
  const [fileMsg, setFileMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch land image and details from the backend
  const fetchLandDetails = async () => {
    setLoadingLand(true);
    try {
      const data = await authApi.getLandDetails();
      if (data) {
        setLandDetails(data);
      }
    } catch (err) {
      console.warn('Could not fetch land details:', err);
    } finally {
      setLoadingLand(false);
    }
  };

  useEffect(() => {
    fetchLandDetails();
  }, []);

  // Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile(editProfile);
      setProfileMsg({ type: 'success', text: 'Farmer profile updated successfully!' });
      await fetchLandDetails();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    try {
      const res = await authApi.changePassword(oldPassword, newPassword);
      setPassMsg({ type: 'success', text: res.detail || 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!idDocFile && !landImgFile) {
      setFileMsg({ type: 'error', text: 'Select at least one file to upload.' });
      return;
    }
    const formData = new FormData();
    if (idDocFile) formData.append('id_documentation', idDocFile);
    if (landImgFile) formData.append('land_image', landImgFile);
    setUploading(true);
    setFileMsg(null);
    try {
      await farmerApi.updateDetails(formData);
      setFileMsg({ type: 'success', text: 'Documents uploaded successfully.' });
      await updateProfile({});
      await fetchLandDetails();
      setIdDocFile(null);
      setLandImgFile(null);
    } catch (err) {
      setFileMsg({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const formatMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const rawLandImg = landDetails?.land_image || profile.land_image || profile.land_image_url;
  const rawIdDoc = landDetails?.id_documentation || profile.id_documentation || profile.id_documentation_url;

  const displayLandImg = formatMediaUrl(rawLandImg);
  const displayIdDoc = formatMediaUrl(rawIdDoc);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [displayLandImg]);

  return (
    <div className="module-container">
      <div className="module-header-box">
        <div>
          <span className="module-pill">Farmer Profile • കർഷക പ്രൊഫൈൽ</span>
          <h2>Farmer Identity, Land Registry &amp; Credentials</h2>
          <p>Logged in: <strong>{user?.username}</strong> — live data from backend.</p>
        </div>
      </div>

      <div className="profile-dashboard-layout">
        {/* LEFT COLUMN */}
        <div className="profile-main-col">
          {/* Identity Card */}
          <div className="identity-summary-card">
            <div className="identity-avatar-large">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="identity-info-block">
              <div className="identity-name-row">
                <h3>{user?.username || 'Farmer'}</h3>
                {(landDetails?.is_verified_farmer ?? profile.is_verified_farmer) && (
                  <span className="verified-seal">🛡️ Government Verified Farmer</span>
                )}
              </div>
              <p className="identity-contact">
                📧 {user?.email} | 📞 {landDetails?.phone_number || profile.phone_number || '—'}
              </p>
              <div className="identity-tags-row">
                <span className="tag-pill">District: {landDetails?.district || profile.district || 'Palakkad'}</span>
                <span className="tag-pill">Village: {landDetails?.panchayath_or_village || profile.panchayath_or_village || '—'}</span>
                <span className="tag-pill">Land: {landDetails?.land_area || profile.land_area || '1.00'} {landDetails?.land_area_unit || profile.land_area_unit || 'ACRES'}</span>
                <span className="tag-pill">Soil: {landDetails?.soil_type || profile.soil_type || 'LATERITE'}</span>
              </div>
            </div>
          </div>

          {/* Land Image & Details Showcase Card */}
          <div className="module-form-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🌾 Registered Land Image &amp; Agro Details</h3>
              <button 
                type="button" 
                onClick={fetchLandDetails} 
                className="btn-secondary" 
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
                disabled={loadingLand}
              >
                {loadingLand ? 'Refreshing…' : '🔄 Refresh Land Details'}
              </button>
            </div>

            {displayLandImg && !imgError ? (
              <div style={{ marginBottom: '1.2rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1e7dd' }}>
                <img 
                  src={displayLandImg} 
                  alt="Farmer Land Imagery" 
                  onError={() => setImgError(true)}
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '0.5rem 0.8rem', background: '#f8f9fa', fontSize: '0.8rem', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ Live Land Satellite/Field Photo</span>
                  <a href={displayLandImg} target="_blank" rel="noopener noreferrer" style={{ color: '#0b7a3e', textDecoration: 'none', fontWeight: 600 }}>
                    Open full resolution ↗
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1.2rem', border: '1px dashed #ced4da' }}>
                <p style={{ margin: 0, color: '#6c757d' }}>📷 No land image uploaded yet. Use the upload form below to add your land photograph or satellite image.</p>
              </div>
            )}

            {/* Quick Land Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', background: '#f4fbf7', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <small style={{ color: '#666', display: 'block' }}>Current Crop</small>
                <strong>{landDetails?.current_crop || profile.current_crop || 'Rice'}</strong>
              </div>
              <div>
                <small style={{ color: '#666', display: 'block' }}>Growth Stage</small>
                <strong>{landDetails?.growth_stage || profile.growth_stage || 'VEGETATIVE'}</strong>
              </div>
              <div>
                <small style={{ color: '#666', display: 'block' }}>Water Availability</small>
                <strong>{landDetails?.water_availability || profile.water_availability || 'MEDIUM'}</strong>
              </div>
              <div>
                <small style={{ color: '#666', display: 'block' }}>Irrigation</small>
                <strong>{landDetails?.irrigation_method || profile.irrigation_method || 'FLOOD'}</strong>
              </div>
              <div>
                <small style={{ color: '#666', display: 'block' }}>Soil pH</small>
                <strong>{landDetails?.soil_ph || profile.soil_ph || '—'}</strong>
              </div>
              <div>
                <small style={{ color: '#666', display: 'block' }}>ID Document</small>
                {displayIdDoc ? (
                  <a href={displayIdDoc} target="_blank" rel="noopener noreferrer" style={{ color: '#0b7a3e', fontWeight: 600 }}>
                    📄 View Document
                  </a>
                ) : (
                  <span style={{ color: '#999' }}>Not uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="module-form-card" style={{ marginTop: '1.5rem' }}>
            <h3>Update Profile Parameters</h3>
            <p className="form-subtext">Endpoint: <code>PUT /api/profile/</code></p>

            {profileMsg && (
              <div className={`status-alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Current Growth Stage (വളർച്ചാ ഘട്ടം)</label>
                  <select
                    value={editProfile.growth_stage}
                    onChange={(e) => setEditProfile({ ...editProfile, growth_stage: e.target.value })}
                    className="module-select"
                  >
                    {GROWTH_STAGES && GROWTH_STAGES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Pest Risk Level</label>
                  <select
                    value={editProfile.last_estimated_pest_risk}
                    onChange={(e) => setEditProfile({ ...editProfile, last_estimated_pest_risk: e.target.value })}
                    className="module-select"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Cultivation Budget (₹)</label>
                  <input
                    type="number"
                    value={editProfile.cultivation_budget}
                    onChange={(e) => setEditProfile({ ...editProfile, cultivation_budget: e.target.value })}
                    className="module-input"
                  />
                </div>

                <div className="form-group">
                  <label>UPI ID (ബാങ്ക് പേയ്മെന്റ്)</label>
                  <input
                    type="text"
                    value={editProfile.upi_id}
                    onChange={(e) => setEditProfile({ ...editProfile, upi_id: e.target.value })}
                    className="module-input"
                    placeholder="e.g. farmer@oksbi"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Panchayath / Village (പഞ്ചായത്ത്)</label>
                  <input
                    type="text"
                    value={editProfile.panchayath_or_village}
                    onChange={(e) => setEditProfile({ ...editProfile, panchayath_or_village: e.target.value })}
                    className="module-input"
                  />
                </div>

                <div className="form-group">
                  <label>Irrigation Method</label>
                  <select
                    value={editProfile.irrigation_method}
                    onChange={(e) => setEditProfile({ ...editProfile, irrigation_method: e.target.value })}
                    className="module-select"
                  >
                    {IRRIGATION_METHODS && IRRIGATION_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Historical Pest Incidents</label>
                <input
                  type="text"
                  value={editProfile.historical_pest_issues}
                  onChange={(e) => setEditProfile({ ...editProfile, historical_pest_issues: e.target.value })}
                  className="module-input"
                  placeholder="e.g. Stem borer, Rice blast"
                />
              </div>

              <button type="submit" className="module-action-btn" disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Profile'}
              </button>
            </form>
          </div>

          {/* Document & Land Image Upload Form */}
          <div className="module-form-card" style={{ marginTop: '1.5rem' }}>
            <h3>📁 Upload ID &amp; Land Documents</h3>
            <p className="form-subtext">Endpoint: <code>PUT /api/profile/</code></p>

            {fileMsg && (
              <div className={`status-alert alert-${fileMsg.type}`}>{fileMsg.text}</div>
            )}

            <form onSubmit={handleFileSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>ID Documentation (Aadhaar / Land Record)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setIdDocFile(e.target.files[0])}
                    className="module-input"
                    style={{ padding: '0.4rem' }}
                  />
                  {idDocFile && <small style={{ color: '#0b7a3e' }}>✓ {idDocFile.name}</small>}
                </div>

                <div className="form-group">
                  <label>Land Image (Satellite / Drone / Photo)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setLandImgFile(e.target.files[0])}
                    className="module-input"
                    style={{ padding: '0.4rem' }}
                  />
                  {landImgFile && <small style={{ color: '#0b7a3e' }}>✓ {landImgFile.name}</small>}
                </div>
              </div>

              <button type="submit" className="module-action-btn" disabled={uploading}>
                {uploading ? 'Uploading…' : '📤 Upload Documents'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-side-col">
          {/* Change Password */}
          <div className="module-form-card">
            <h3>Change Password</h3>
            <p className="form-subtext">Endpoint: <code>PUT /api/change-password/</code></p>

            {passMsg && (
              <div className={`status-alert alert-${passMsg.type}`}>{passMsg.text}</div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="module-input"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="New strong password"
                  className="module-input"
                />
              </div>

              <button type="submit" className="module-action-btn btn-secondary">
                Update Password
              </button>
            </form>
          </div>

          {/* Telemetry Metadata */}
          <div className="telemetry-meta-card">
            <h4>📡 Telemetry Coordinates</h4>
            <div className="meta-row">
              <span>Latitude:</span>
              <strong>{landDetails?.latitude || profile.latitude || '—'}° N</strong>
            </div>
            <div className="meta-row">
              <span>Longitude:</span>
              <strong>{landDetails?.longitude || profile.longitude || '—'}° E</strong>
            </div>
            <div className="meta-row">
              <span>Soil pH:</span>
              <strong>{landDetails?.soil_ph || profile.soil_ph || '—'}</strong>
            </div>
            <div className="meta-row">
              <span>Water Source:</span>
              <strong>{landDetails?.primary_water_source || profile.primary_water_source || '—'}</strong>
            </div>
            <div className="meta-row">
              <span>Voice Assistant:</span>
              <strong className="text-success">
                {profile.voice_assistant_enabled ? 'Enabled (മലയാളം)' : 'Disabled'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
