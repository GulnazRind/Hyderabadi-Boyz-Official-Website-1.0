import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Gallery from './components/Gallery';
import RegistrationForm from './components/RegistrationForm';
import Matches from './components/Matches';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AdminGallery from './pages/AdminGallery';
import EmailVerification from './components/EmailVerification';
import LiveStream from './components/LiveStream';
import './App.css';

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/live" element={<LiveStream />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-gallery" element={<AdminGallery />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;