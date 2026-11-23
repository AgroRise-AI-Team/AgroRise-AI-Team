import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import EntryPage from './components/EntryPage';
import Navbar from './components/Navbar';
import ProfileModule from './components/modules/ProfileModule';
import MainDashboard from './components/modules/MainDashboard';

import './App.css';

function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();

  const role = user?.profile?.role || user?.role;
  const isFarmer = role === 'FARMER' || role === 'BOTH';

  // If farmer = true, default is profile; if farmer = false (VISITOR / BUYER), default is Visitors Dashboard ('dashboard')
  const [activeTab, setActiveTab] = useState(isFarmer ? 'profile' : 'dashboard');

  // Automatically ensure that when a visitor logs in, they land on the Visitors Dashboard
  useEffect(() => {
    if (user) {
      const currentRole = user?.profile?.role || user?.role;
      const farmerStatus = currentRole === 'FARMER' || currentRole === 'BOTH';
      if (!farmerStatus) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('profile');
      }
    }
  }, [user]);

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
        {activeTab === 'dashboard' ? (
          <MainDashboard />
        ) : (
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
