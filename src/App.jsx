import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HomePage, BattlePage, LoginPage, StudioPage, ProfilePage } from './pages';
import Navigation from './components/Navigation';
import './api/CardRepository'; // Initialize CardRepository

function AppContent() {
  const location = useLocation();
  const isBattle = location.pathname === '/battle';

  return (
    <div className="app-container">
      {!isBattle && <Navigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
