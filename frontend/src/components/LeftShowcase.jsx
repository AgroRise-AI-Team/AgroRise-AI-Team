import React, { useState } from 'react';
import { SproutLogo, SearchIcon, SatelliteIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

export default function LeftShowcase() {
  const { t } = useAuth();
  const [activePin, setActivePin] = useState(null);

  const telemetryPins = [
    { id: 1, x: '24%', y: '28%', label: 'Drone Alpha-04: Aerial NDVI Crop Scan' },
    { id: 2, x: '78%', y: '72%', label: 'Sensor Node B: Soil Moisture 78% (Optimal)' },
    { id: 3, x: '52%', y: '56%', label: 'Precision Irrigation: Micro-Sprinkler Zone' }
  ];

  return (
    <section className="showcase-card">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-box">
          <SproutLogo size={32} />
        </div>
        <div className="brand-text">
          <h2 className="brand-title">{t.appName}</h2>
          <span className="brand-subtitle">{t.subHeadline}</span>
        </div>
      </div>

      {/* Hero Headings */}
      <div className="hero-text-block">
        <h1 className="hero-heading">
          <span className="heading-dark">{t.entryHeadline1}</span>
          <br />
          <span className="heading-green">{t.entryHeadline2}</span>
        </h1>
        <p className="hero-description">
          {t.entryDesc}
        </p>
      </div>

      {/* Farm Telemetry Dashboard Mockup */}
      <div className="mockup-window">
        {/* Mockup Top Navigation Bar */}
        <div className="mockup-header">
          <div className="mockup-header-left">
            <span className="mockup-title">{t.appName}</span>
            <div className="telemetry-status-pill">
              <span className="pulsing-dot"></span>
              <span className="telemetry-count">{t.telemetryNodes}</span>
            </div>
          </div>
          <div className="mockup-search">
            <SearchIcon size={12} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search" 
              readOnly 
              aria-label="Dashboard search"
            />
          </div>
        </div>

        {/* Mockup Screen Visual */}
        <div className="mockup-viewport">
          <img 
            src="/farm-illustration.jpg" 
            alt="AgroRise AI Smart Farm Telemetry View" 
            className="farm-image"
          />

          {/* Interactive Telemetry Sensor Pins */}
          {telemetryPins.map(pin => (
            <div 
              key={pin.id} 
              className="telemetry-pin" 
              style={{ left: pin.x, top: pin.y }}
              onMouseEnter={() => setActivePin(pin.id)}
              onMouseLeave={() => setActivePin(null)}
            >
              <div className="pin-pulse"></div>
              <div className="pin-core"></div>
              {activePin === pin.id && (
                <div className="pin-tooltip">
                  {pin.label}
                </div>
              )}
            </div>
          ))}

          {/* Sentinel Sync Badge */}
          <div className="sync-badge">
            <SatelliteIcon size={13} />
            <span>Sentinel-2 Sync: 4 mins ago</span>
          </div>
        </div>
      </div>
    </section>
  );
}
