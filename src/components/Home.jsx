import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import './Home.css';

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
    const interval = setInterval(fetchTournaments, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (tournament) => {
    if (!tournament.date || !tournament.time) return null;
    const startDateTime = new Date(`${tournament.date}T${tournament.time}`);
    const now = new Date();
    const diff = startDateTime - now;
    if (diff <= 0) return 'Started';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">🏆 Hyderabad's #1 Armwrestling Team</div>
          <h1 className="hero-title">Welcome to <span className="gold-text">Hyderabadi Boyz</span></h1>
          <p className="hero-subtitle">Where Champions Are Made</p>
          <p className="hero-description">
            We are building a team of serious armwrestlers who want to take their 
            passion to the next level. Join us in our journey to become champions.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Register Now →</Link>
            <Link to="/matches" className="btn btn-secondary">View Matches</Link>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section className="section-container">
        <h2 className="section-title">🏆 Upcoming Tournaments</h2>
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="loading-shimmer"></div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            <p>No tournaments scheduled yet.</p>
            <p className="empty-sub">Check back soon!</p>
          </div>
        ) : (
          <div className="card-grid">
            {tournaments.map((tournament) => {
              const timeRemaining = getTimeRemaining(tournament);
              return (
                <div key={tournament.id} className="card tournament-card">
                  <div className={`card-status ${tournament.status}`}>
                    {tournament.status === 'active' ? 'Live' : 
                     tournament.status === 'completed' ? 'Done' : 'Upcoming'}
                  </div>
                  <div className="card-title">{tournament.name}</div>
                  <div className="card-content">
                    <p>📅 {new Date(tournament.date).toLocaleDateString()}</p>
                    <p>⏰ {tournament.time}</p>
                    <p>📍 {tournament.location}</p>
                    <p><strong>Category:</strong> {tournament.category}</p>
                    {tournament.status === 'upcoming' && timeRemaining && (
                      <div className="timer-box">⏳ Time Remaining: <strong>{timeRemaining}</strong></div>
                    )}
                    {tournament.status === 'active' && (
                      <div className="live-box"><span className="live-dot"></span> Live Now!</div>
                    )}
                  </div>
                  {tournament.status !== 'completed' && (
                    <Link to={`/register?tournament=${tournament.id}`} className="btn btn-primary register-btn">
                      Register Now →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <h2 className="section-title">⭐ Our Vision</h2>
        <div className="vision-grid">
          <div className="vision-card">
            <div className="vision-icon">🏆</div>
            <h3>Excellence</h3>
            <p>We strive for excellence in armwrestling, representing Hyderabad with pride.</p>
          </div>
          <div className="vision-card">
            <div className="vision-icon">🤝</div>
            <h3>Community</h3>
            <p>Building a strong community of armwrestling enthusiasts in Hyderabad.</p>
          </div>
          <div className="vision-card">
            <div className="vision-icon">⭐</div>
            <h3>Recognition</h3>
            <p>Creating opportunities for talented armwrestlers to shine nationally.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;