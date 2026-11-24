import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import EntryPage from './components/EntryPage';
import Navbar from './components/Navbar';
import ProfileModule from './components/modules/ProfileModule';
import MainDashboard from './components/modules/MainDashboard';
import SmartLandAnalyzer from './components/modules/SmartLandAnalyzer';
import CropProfitEstimator from './components/modules/CropProfitEstimator';

import './App.css';


function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();

  const role = user?.profile?.role || user?.role;
  const isFarmer = role === 'FARMER' || role === 'BOTH';

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);

  // Set initial default tab only ONCE upon initial login
  useEffect(() => {
    if (user?.id && !hasInitializedTab) {
      const currentRole = user?.profile?.role || user?.role;
      const farmerStatus = currentRole === 'FARMER' || currentRole === 'BOTH';
      setActiveTab(farmerStatus ? 'profile' : 'dashboard');
      setHasInitializedTab(true);
    } else if (!user?.id) {
      setHasInitializedTab(false);
    }
  }, [user?.id, hasInitializedTab]);

  if (loading) {
    return (
      <div className="global-loader-screen">
        <div className="module-spinner"></div>
        <p>Loading AgroRise Account...</p>
      </div>
    );
  }

  // If user is NOT logged in, show entry page with login/register modals
  if (!isAuthenticated) {
    return <EntryPage />;
  }

  // Once authenticated:
  return (
    <div className="dashboard-app-shell">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="dashboard-main-content">
        {activeTab === 'dashboard' && <MainDashboard />}
        {activeTab === 'land_analyzer' && <SmartLandAnalyzer />}
        {activeTab === 'profit_estimator' && <CropProfitEstimator />}
        {activeTab === 'profile' && (
          <ProfileModule isVisitor={!isFarmer} onGoToDashboard={() => setActiveTab('dashboard')} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
