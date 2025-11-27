import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import SuryanamaskarDetection from './pages/Detection/SuryanamaskarDetection';
import YogaDetection from './pages/Detection/YogaDetection';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suryanamaskar" element={<SuryanamaskarDetection />} />
          <Route path="/yoga" element={<YogaDetection />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
