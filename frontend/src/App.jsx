import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import EntryPage from './components/EntryPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ProfileModule from './components/modules/ProfileModule';
import MainDashboard from './components/modules/MainDashboard';
import SmartLandAnalyzer from './components/modules/SmartLandAnalyzer';
import CropProfitEstimator from './components/modules/CropProfitEstimator';
import AgroChatbot from './components/modules/AgroChatbot';
import LeafDiseaseScanner from './components/modules/LeafDiseaseScanner';
import AgriNewsSection from './components/modules/AgriNewsSection';
import EnquiryModule from './components/modules/EnquiryModule';
import ErrorBoundary from './components/common/ErrorBoundary';

import './App.css';


function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();

  const role = user?.profile?.role || user?.role;
  const isFarmer = role === 'FARMER';

  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set initial default tab only ONCE upon initial login
  useEffect(() => {
    if (user?.id && !hasInitializedTab) {
      const currentRole = user?.profile?.role || user?.role;
      const farmerStatus = currentRole === 'FARMER';
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
    <div className="dashboard-app-shell single-page-layout">
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Modern Left Sidebar with Feature Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Single Page Content Area */}
      <div className="app-main-wrapper">
        <TopHeader 
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSelectTab={setActiveTab}
        />

        <main className="dashboard-main-content">
          <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
            {activeTab === 'dashboard' && (
              <MainDashboard onOpenEnquiries={() => setActiveTab('enquiries')} />
            )}
            {activeTab === 'news' && (
              <div className="module-container">
                <AgriNewsSection />
              </div>
            )}
            {activeTab === 'enquiries' && (
              <EnquiryModule onGoToFarmersFeed={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'land_analyzer' && <SmartLandAnalyzer />}
            {activeTab === 'profit_estimator' && <CropProfitEstimator />}
            {activeTab === 'leaf_doctor' && <LeafDiseaseScanner />}
            {activeTab === 'ai_chat' && <AgroChatbot isFullPage={true} />}
            {activeTab === 'profile' && (
              <ProfileModule isVisitor={!isFarmer} onGoToDashboard={() => setActiveTab('dashboard')} />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating Gemini AI Assistant Accessible from Any Screen */}
      {activeTab !== 'ai_chat' && <AgroChatbot isFullPage={false} />}
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
