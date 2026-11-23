import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import EntryPage from './components/EntryPage';
import Navbar from './components/Navbar';
import ProfileModule from './components/modules/ProfileModule';

import './App.css';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="global-loader-screen">
        <div className="module-spinner"></div>
        <p>Loading AgroRise Account...</p>
      </div>
    );
  }

  // If farmer is NOT logged in, show the entry page with login/register modals
  if (!isAuthenticated) {
    return <EntryPage />;
  }

  // Once authenticated, show dashboard with profile & account settings
  return (
    <div className="dashboard-app-shell">
      <Navbar activeTab="profile" />

      <main className="dashboard-main-content">
        <ProfileModule />
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
