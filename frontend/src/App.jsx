import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-stadium-dark text-slate-100 selection:bg-brand-primary/30 selection:text-emerald-300">
        <Header />
        
        {/* React Router route switches */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
