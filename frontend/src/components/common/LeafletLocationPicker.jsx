import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { smartLandAnalyzerApi } from '../../services/api';

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Kerala District Coordinates
const DISTRICT_COORDS = {
  "Kozhikode": [11.2588, 75.7804],
  "Palakkad": [10.7867, 76.6548],
  "Wayanad": [11.6854, 76.1320],
  "Thrissur": [10.5276, 76.2144],
  "Alappuzha": [9.4981, 76.3388],
  "Ernakulam": [9.9816, 76.2999],
  "Idukki": [9.8500, 76.9667],
  "Malappuram": [11.0510, 76.0711],
  "Kannur": [11.8745, 75.3704],
  "Kasaragod": [12.5102, 74.9852],
  "Kottayam": [9.5916, 76.5222],
  "Kollam": [8.8932, 76.6141],
  "Pathanamthitta": [9.2648, 76.7870],
  "Thiruvananthapuram": [8.5241, 76.9366]
};

// Helper: Calculate distance and find nearest Kerala District
function findNearestDistrict(lat, lng) {
  let nearest = "Kozhikode";
  let minDistance = Infinity;

  for (const [dist, coords] of Object.entries(DISTRICT_COORDS)) {
    const dLat = coords[0] - lat;
    const dLng = coords[1] - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      nearest = dist;
    }
  }
  return nearest;
}

export default function LeafletLocationPicker({ selectedDistrict, onSelectDistrict }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const facilityMarkersRef = useRef([]);

  const [coords, setCoords] = useState(DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS["Kozhikode"]);
  const [nearbyData, setNearbyData] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize or update Leaflet map when opened
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords = DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS["Kozhikode"];
      const map = L.map(mapContainerRef.current).setView(initialCoords, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      // Farm Pin Marker
      const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
      marker.bindPopup(`<b>🌱 Your Selected Farm Location</b><br/>${selectedDistrict || 'Kerala'}`).openPopup();

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        handleLocationChange(newPos.lat, newPos.lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleLocationChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
    }
  }, [isOpen]);

  // Sync map center when selectedDistrict prop changes from parent
  useEffect(() => {
    if (selectedDistrict && DISTRICT_COORDS[selectedDistrict]) {
      const target = DISTRICT_COORDS[selectedDistrict];
      setCoords(target);
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView(target, 11);
        markerRef.current.setLatLng(target);
        markerRef.current.bindPopup(`<b>🌱 Your Selected Farm Location</b><br/>${selectedDistrict}`).openPopup();
      }
      fetchNearbyFacilities(selectedDistrict, target[0], target[1]);
    }
  }, [selectedDistrict]);

  const handleLocationChange = (lat, lng) => {
    setCoords([lat, lng]);
    const detectedDistrict = findNearestDistrict(lat, lng);
    if (markerRef.current) {
      markerRef.current.bindPopup(`<b>🌱 Pinned Location</b><br/>Nearest: <b>${detectedDistrict}</b><br/><small>${lat.toFixed(4)}, ${lng.toFixed(4)}</small>`).openPopup();
    }
    if (onSelectDistrict && detectedDistrict !== selectedDistrict) {
      onSelectDistrict(detectedDistrict);
    }
    fetchNearbyFacilities(detectedDistrict, lat, lng);
  };

  const fetchNearbyFacilities = async (distName, lat, lng) => {
    setLoadingNearby(true);
    try {
      const data = await smartLandAnalyzerApi.getNearbyFacilities(distName, lat, lng);
      setNearbyData(data);

      // Place facility markers on map
      if (mapInstanceRef.current && data?.facilities) {
        // Clear previous facility markers
        facilityMarkersRef.current.forEach(m => m.remove());
        facilityMarkersRef.current = [];

        data.facilities.forEach(fac => {
          const isLab = fac.type.includes('Lab');
          const customHtml = `<div style="background:${isLab ? '#8b5cf6' : '#16a34a'};color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:13px;">${isLab ? '🧪' : '🏛️'}</div>`;
          const icon = L.divIcon({ html: customHtml, className: 'facility-icon', iconSize: [26, 26] });

          const facMarker = L.marker([fac.lat, fac.lng], { icon }).addTo(mapInstanceRef.current);
          facMarker.bindPopup(`
            <div style="font-size:12px;line-height:1.4;">
              <strong style="color:#0f172a;">${fac.name}</strong><br/>
              <span style="color:#166534;">${fac.malayalam}</span><br/>
              <small style="color:#64748b;">${fac.address}</small><br/>
              <b>Distance:</b> ${fac.distance_km} km<br/>
              <b>Contact:</b> <a href="tel:${fac.contact}">${fac.contact}</a>
            </div>
          `);
          facilityMarkersRef.current.push(facMarker);
        });
      }
    } catch (e) {
      console.warn('Failed to load nearby facilities:', e);
    } finally {
      setLoadingNearby(false);
    }
  };

  // Browser Geolocation (Detect Current GPS)
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        if (!isOpen) setIsOpen(true);
        setTimeout(() => {
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 13);
            markerRef.current.setLatLng([latitude, longitude]);
          }
          handleLocationChange(latitude, longitude);
        }, 300);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Could not detect GPS location: ${err.message}. Please select or click on the map.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Trigger Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isOpen ? '#0b592b' : '#f0fdf4',
            color: isOpen ? '#ffffff' : '#0b592b',
            border: '1px solid #86efac',
            padding: '7px 12px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <span>🗺️ {isOpen ? 'Hide Leaflet Map' : 'Open Leaflet Map & Nearby Centers'}</span>
        </button>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          style={{
            background: '#ffffff',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            padding: '7px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: gpsLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {gpsLoading ? '📡 Locating...' : '📍 Detect My GPS'}
        </button>
      </div>

      {/* Expandable Leaflet Map & Nearby Centers Container */}
      {isOpen && (
        <div style={{
          marginTop: '12px',
          background: '#ffffff',
          border: '2px solid #86efac',
          borderRadius: '14px',
          padding: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
        }}>
          {/* Map Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>
              💡 <strong>Click or drag pin</strong> to set farm location: <strong style={{ color: '#0f172a' }}>{selectedDistrict}</strong> ({coords[0]?.toFixed(3)}, {coords[1]?.toFixed(3)})
            </span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem' }}>
              <span>🌱 Farm Pin</span>
              <span>🏛️ Krishi Bhavan</span>
              <span>🧪 Soil Lab</span>
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            style={{
              height: '240px',
              width: '100%',
              borderRadius: '10px',
              zIndex: 1,
              marginBottom: '10px'
            }}
          />

          {/* Nearby Facilities List */}
          {nearbyData?.facilities && (
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                🏛️ Nearest Agricultural Centers in {selectedDistrict}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nearbyData.facilities.map((fac, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{fac.name}</strong> ({fac.malayalam})<br />
                      <span style={{ color: '#64748b' }}>📞 {fac.contact} • {fac.address}</span>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                        {fac.distance_km} km away
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
