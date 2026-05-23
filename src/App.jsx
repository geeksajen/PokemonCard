import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, BattlePage, LoginPage, StudioPage, ProfilePage } from './pages';
import Navigation from './components/Navigation';
import './api/CardRepository'; // Initialize CardRepository

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
