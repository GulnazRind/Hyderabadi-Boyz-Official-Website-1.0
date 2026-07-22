import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Home = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
    
    // Auto refresh every minute for timer updates
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

  // Get time remaining for tournament
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
      <section className="hero-section">
        <h1 className="hero-title">🏆 Hyderabadi Boyz</h1>
        <p className="hero-subtitle">Hyderabad's Premier Armwrestling Team</p>
        <p className="hero-description">
          We are building a team of serious armwrestlers who want to take their 
          passion to the next level. Join us in our journey to become champions.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">
            📝 Register Now
          </Link>
          <Link to="/matches" className="btn btn-secondary">
            ⚔️ View Matches
          </Link>
        </div>
      </section>

      {/* Tournaments Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 className="section-title">🏆 Tournaments</h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading tournaments...</p>
        ) : tournaments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No tournaments scheduled yet.</p>
        ) : (
          <div className="card-grid">
            {tournaments.map(tournament => {
              const timeRemaining = getTimeRemaining(tournament);
              return (
                <div key={tournament.id} className="card" style={{
                  border: `2px solid ${
                    tournament.status === 'active' ? '#2ecc71' : 
                    tournament.status === 'completed' ? '#3498db' : 
                    '#FFD700'
                  }`
                }}>
                  <div className="card-title">{tournament.name}</div>
                  <div className="card-content">
                    <p><strong>📅 Date:</strong> {new Date(tournament.date).toLocaleDateString()}</p>
                    <p><strong>⏰ Time:</strong> {tournament.time}</p>
                    <p><strong>📍 Location:</strong> {tournament.location}</p>
                    <p><strong>🏷️ Category:</strong> {tournament.category}</p>
                    <p><strong>⏱️ Duration:</strong> {tournament.duration_hours || 4} hours</p>
                    <p><strong>📊 Status:</strong> 
                      <span className={`tournament-status status-${tournament.status}`}>
                        {tournament.status === 'active' ? '▶️ Active' : 
                         tournament.status === 'completed' ? '✅ Completed' : '📅 Upcoming'}
                      </span>
                    </p>
                    
                    {/* Countdown Timer */}
                    {tournament.status === 'upcoming' && timeRemaining && (
                      <p style={{ 
                        color: '#FFD700', 
                        fontWeight: 'bold',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '5px'
                      }}>
                        ⏳ Time Remaining: {timeRemaining}
                      </p>
                    )}
                    
                    {tournament.status === 'active' && (
                      <p style={{ 
                        color: '#2ecc71', 
                        fontWeight: 'bold',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: 'rgba(46, 204, 113, 0.1)',
                        borderRadius: '5px'
                      }}>
                        🔴 LIVE NOW!
                      </p>
                    )}
                    
                    {tournament.description && (
                      <p style={{ marginTop: '0.5rem', color: '#888' }}>{tournament.description}</p>
                    )}
                  </div>
                  
                  {/* Register Button */}
                  {tournament.status !== 'completed' && (
                    <div style={{ marginTop: '1rem' }}>
                      <Link 
                        to={`/register?tournament=${tournament.id}`}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          textAlign: 'center',
                          display: 'block'
                        }}
                      >
                        📝 Register for this Tournament
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="vision-section">
        <h2 className="section-title">Our Vision</h2>
        <div className="vision-grid">
          <div className="vision-card">
            <h3>🏆 Excellence</h3>
            <p>We strive for excellence in armwrestling, representing Hyderabad with pride.</p>
          </div>
          <div className="vision-card">
            <h3>🤝 Community</h3>
            <p>Building a strong community of armwrestling enthusiasts in Hyderabad.</p>
          </div>
          <div className="vision-card">
            <h3>⭐ Recognition</h3>
            <p>Creating opportunities for talented armwrestlers to shine nationally.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;