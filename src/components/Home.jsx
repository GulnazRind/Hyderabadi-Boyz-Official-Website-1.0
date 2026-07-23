import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { RiTrophyLine, RiTeamLine, RiStarLine, RiCalendarLine, RiTimeLine, RiMapPinLine } from '@remixicon/react';

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
      {/* Hero Section with Image */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Hyderabadi Boyz</h1>
          <p className="hero-subtitle">Hyderabad's Premier Armwrestling Team</p>
          <p className="hero-description">
            We are building a team of serious armwrestlers who want to take their 
            passion to the next level. Join us in our journey to become champions.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Register Now
            </Link>
            <Link to="/matches" className="btn btn-secondary">
              View Matches
            </Link>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 className="section-title">Tournaments</h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading tournaments...</p>
        ) : tournaments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No tournaments scheduled yet.</p>
        ) : (
          <div className="card-grid">
            {tournaments.map(tournament => {
              const timeRemaining = getTimeRemaining(tournament);
              return (
                <div key={tournament.id} className="card tournament-card" style={{
                  border: `2px solid ${
                    tournament.status === 'active' ? '#2ecc71' : 
                    tournament.status === 'completed' ? '#3498db' : 
                    '#FFD700'
                  }`
                }}>
                  <div className="card-title">{tournament.name}</div>
                  <div className="card-content">
                    <p><RiCalendarLine size={16} /> Date: {new Date(tournament.date).toLocaleDateString()}</p>
                    <p><RiTimeLine size={16} /> Time: {tournament.time}</p>
                    <p><RiMapPinLine size={16} /> Location: {tournament.location}</p>
                    <p><strong>Category:</strong> {tournament.category}</p>
                    <p><strong>Status:</strong> 
                      <span className={`tournament-status status-${tournament.status}`}>
                        {tournament.status === 'active' ? 'Active' : 
                         tournament.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </span>
                    </p>
                    {tournament.status === 'upcoming' && timeRemaining && (
                      <p className="timer">Time Remaining: {timeRemaining}</p>
                    )}
                    {tournament.status === 'active' && (
                      <p className="live-badge">Live Now!</p>
                    )}
                  </div>
                  {tournament.status !== 'completed' && (
                    <Link to={`/register?tournament=${tournament.id}`} className="btn btn-primary register-btn">
                      Register for this Tournament
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
        <h2 className="section-title">Our Vision</h2>
        <div className="vision-grid">
          <div className="vision-card">
            <RiTrophyLine size={48} className="vision-icon" />
            <h3>Excellence</h3>
            <p>We strive for excellence in armwrestling, representing Hyderabad with pride.</p>
          </div>
          <div className="vision-card">
            <RiTeamLine size={48} className="vision-icon" />
            <h3>Community</h3>
            <p>Building a strong community of armwrestling enthusiasts in Hyderabad.</p>
          </div>
          <div className="vision-card">
            <RiStarLine size={48} className="vision-icon" />
            <h3>Recognition</h3>
            <p>Creating opportunities for talented armwrestlers to shine nationally.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-container { padding: 2rem 0; }
        
        .hero-section {
          position: relative;
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 15px;
          margin-bottom: 3rem;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(10,10,10,0.7), rgba(26,26,26,0.9));
          border: 1px solid rgba(255,215,0,0.2);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200') center/cover;
          opacity: 0.15;
          z-index: 0;
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
        }
        
        .hero-title {
          font-size: 3.5rem;
          color: #FFD700;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(255,215,0,0.3);
          animation: fadeInUp 1s ease;
        }
        
        .hero-subtitle {
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 1rem;
          animation: fadeInUp 1.2s ease;
        }
        
        .hero-description {
          font-size: 1.2rem;
          color: #ccc;
          max-width: 700px;
          margin: 0 auto 2rem;
          line-height: 1.8;
          animation: fadeInUp 1.4s ease;
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 1.6s ease;
        }
        
        .section-title {
          text-align: center;
          font-size: 2.5rem;
          color: #FFD700;
          margin-bottom: 2rem;
        }
        
        .section-title::after {
          content: '';
          display: block;
          width: 100px;
          height: 3px;
          background: linear-gradient(135deg, #FFD700, #DAA520);
          margin: 0.5rem auto;
        }
        
        .vision-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          padding: 0 2rem;
        }
        
        .vision-card {
          background: rgba(26,26,26,0.9);
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          border: 1px solid rgba(255,215,0,0.1);
          transition: all 0.3s ease;
        }
        
        .vision-card:hover {
          transform: translateY(-5px);
          border-color: #FFD700;
          box-shadow: 0 10px 30px rgba(255,215,0,0.1);
        }
        
        .vision-icon {
          color: #FFD700;
          margin-bottom: 1rem;
        }
        
        .vision-card h3 {
          color: #FFD700;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .vision-card p {
          color: #ccc;
          line-height: 1.6;
        }
        
        .tournament-card {
          position: relative;
          overflow: hidden;
        }
        
        .register-btn {
          width: 100%;
          text-align: center;
          margin-top: 1rem;
          display: block;
        }
        
        .timer {
          color: #FFD700;
          font-weight: bold;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255,215,0,0.1);
          border-radius: 5px;
        }
        
        .live-badge {
          color: #2ecc71;
          font-weight: bold;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(46,204,113,0.1);
          border-radius: 5px;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .hero-subtitle { font-size: 1.3rem; }
          .vision-grid { grid-template-columns: 1fr; padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;