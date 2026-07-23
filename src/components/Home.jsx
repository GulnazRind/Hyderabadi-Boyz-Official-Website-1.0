import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { 
  RiTrophyLine, 
  RiTeamLine, 
  RiStarLine, 
  RiCalendarLine, 
  RiTimeLine, 
  RiMapPinLine,
  RiArrowRightLine,
  RiMedalLine,
  RiShieldStarLine,
  RiUserHeartLine
} from '@remixicon/react';

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

      {/* =============================================
          HERO SECTION WITH IMAGE
          ============================================= */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge animate-float">
            <RiShieldStarLine size={20} />
            Hyderabad's #1 Armwrestling Team
          </div>
          <h1 className="hero-title animate-fadeInUp delay-1">
            Welcome to <span className="gold-text">Hyderabadi Boyz</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp delay-2">
            Where Champions Are Made
          </p>
          <p className="hero-description animate-fadeInUp delay-3">
            We are building a team of serious armwrestlers who want to take their 
            passion to the next level. Join us in our journey to become champions.
          </p>
          <div className="hero-buttons animate-fadeInUp delay-4">
            <Link to="/register" className="btn btn-primary">
              <RiUserHeartLine size={20} />
              Register Now
              <RiArrowRightLine size={18} />
            </Link>
            <Link to="/matches" className="btn btn-secondary">
              <RiTrophyLine size={20} />
              View Matches
            </Link>
          </div>
          <div className="hero-stats animate-fadeInUp delay-5">
            <div className="stat-item">
              <RiMedalLine size={28} className="stat-icon" />
              <span className="stat-number">15+</span>
              <span className="stat-label">Tournaments</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <RiTeamLine size={28} className="stat-icon" />
              <span className="stat-number">50+</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <RiTrophyLine size={28} className="stat-icon" />
              <span className="stat-number">10+</span>
              <span className="stat-label">Championships</span>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          TOURNAMENTS SECTION
          ============================================= */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <RiTrophyLine size={32} />
            Upcoming Tournaments
          </h2>
          <p className="section-subtitle">Join the competition and show your strength</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="loading-shimmer" style={{ height: '250px', borderRadius: '15px' }}></div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state">
            <RiCalendarLine size={48} />
            <p>No tournaments scheduled yet.</p>
            <p className="empty-sub">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="card-grid">
            {tournaments.map((tournament, index) => {
              const timeRemaining = getTimeRemaining(tournament);
              return (
                <div 
                  key={tournament.id} 
                  className="card tournament-card animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`card-status ${tournament.status}`}>
                    {tournament.status === 'active' ? 'Live' : 
                     tournament.status === 'completed' ? 'Done' : 'Upcoming'}
                  </div>
                  <div className="card-title">
                    <RiTrophyLine size={24} />
                    {tournament.name}
                  </div>
                  <div className="card-content">
                    <p>
                      <RiCalendarLine size={16} className="icon" />
                      {new Date(tournament.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <RiTimeLine size={16} className="icon" />
                      {tournament.time}
                    </p>
                    <p>
                      <RiMapPinLine size={16} className="icon" />
                      {tournament.location}
                    </p>
                    <p><strong>Category:</strong> {tournament.category}</p>
                    
                    {tournament.status === 'upcoming' && timeRemaining && (
                      <div className="timer-box">
                        <RiTimeLine size={18} />
                        <span>Time Remaining: <strong>{timeRemaining}</strong></span>
                      </div>
                    )}
                    
                    {tournament.status === 'active' && (
                      <div className="live-box">
                        <span className="live-dot"></span>
                        <span>Live Now!</span>
                      </div>
                    )}
                  </div>
                  {tournament.status !== 'completed' && (
                    <Link 
                      to={`/register?tournament=${tournament.id}`} 
                      className="btn btn-primary register-btn"
                    >
                      <RiUserHeartLine size={18} />
                      Register Now
                      <RiArrowRightLine size={16} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =============================================
          VISION SECTION
          ============================================= */}
      <section className="section-container vision-section">
        <div className="section-header">
          <h2 className="section-title">
            <RiStarLine size={32} />
            Our Vision
          </h2>
          <p className="section-subtitle">Building the future of armwrestling in Hyderabad</p>
        </div>

        <div className="vision-grid">
          <div className="vision-card animate-fadeInUp delay-1">
            <div className="vision-icon-wrapper">
              <RiTrophyLine size={48} className="vision-icon" />
            </div>
            <h3>Excellence</h3>
            <p>We strive for excellence in armwrestling, representing Hyderabad with pride on national and international stages.</p>
          </div>
          <div className="vision-card animate-fadeInUp delay-2">
            <div className="vision-icon-wrapper">
              <RiTeamLine size={48} className="vision-icon" />
            </div>
            <h3>Community</h3>
            <p>Building a strong community of armwrestling enthusiasts in Hyderabad, fostering growth and camaraderie.</p>
          </div>
          <div className="vision-card animate-fadeInUp delay-3">
            <div className="vision-icon-wrapper">
              <RiShieldStarLine size={48} className="vision-icon" />
            </div>
            <h3>Recognition</h3>
            <p>Creating opportunities for talented armwrestlers to shine nationally and put Hyderabad on the map.</p>
          </div>
        </div>
      </section>

      {/* =============================================
          CTA SECTION
          ============================================= */}
      <section className="cta-section animate-fadeInUp">
        <div className="cta-content">
          <h2>Ready to Join the Team?</h2>
          <p>Become part of Hyderabad's premier armwrestling community</p>
          <Link to="/register" className="btn btn-primary cta-btn">
            <RiUserHeartLine size={20} />
            Register Now
            <RiArrowRightLine size={18} />
          </Link>
        </div>
      </section>

      {/* =============================================
          STYLES
          ============================================= */}
      <style jsx>{`
        .home-container {
          padding: 0;
        }

        /* =============================================
           HERO SECTION
           ============================================= */
        .hero-section {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          border-radius: 20px;
          margin-bottom: 3rem;
          overflow: hidden;
          background: var(--black);
          border: 1px solid rgba(255,215,0,0.1);
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.15;
          z-index: 0;
          transform: scale(1.1);
          transition: transform 10s ease;
        }

        .hero-section:hover .hero-background {
          transform: scale(1);
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(26,26,26,0.7) 100%);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.5rem;
          background: rgba(255,215,0,0.15);
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 50px;
          color: var(--gold);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .hero-title .gold-text {
          color: var(--gold);
          text-shadow: 0 0 30px rgba(255,215,0,0.3);
        }

        .hero-subtitle {
          font-size: 1.8rem;
          color: var(--text);
          margin-bottom: 1rem;
          font-weight: 300;
        }

        .hero-description {
          font-size: 1.2rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,215,0,0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-icon {
          color: var(--gold);
          margin-bottom: 0.3rem;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--gold);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,215,0,0.2);
        }

        /* =============================================
           SECTION
           ============================================= */
        .section-container {
          margin-bottom: 3rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-title {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 2.5rem;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .section-title::after {
          content: '';
          display: none;
        }

        .section-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        /* =============================================
           TOURNAMENT CARD
           ============================================= */
        .tournament-card {
          position: relative;
          overflow: hidden;
        }

        .card-status {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.4rem 1rem;
          border-radius: 0 15px 0 15px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .card-status.upcoming {
          background: #f39c12;
          color: var(--black);
        }

        .card-status.active {
          background: #2ecc71;
          color: var(--black);
          animation: pulse 1.5s infinite;
        }

        .card-status.completed {
          background: #3498db;
          color: white;
        }

        .icon {
          margin-right: 0.5rem;
          color: var(--gold);
        }

        .timer-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(255,215,0,0.1);
          border-radius: 8px;
          color: var(--gold);
        }

        .live-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(46,204,113,0.1);
          border-radius: 8px;
          color: #2ecc71;
          font-weight: 600;
        }

        .live-dot {
          width: 10px;
          height: 10px;
          background: #2ecc71;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .register-btn {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
        }

        /* =============================================
           VISION CARDS
           ============================================= */
        .vision-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
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
          transform: translateY(-8px);
          border-color: var(--gold);
          box-shadow: 0 15px 40px rgba(255,215,0,0.1);
        }

        .vision-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          background: rgba(255,215,0,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .vision-card:hover .vision-icon-wrapper {
          background: rgba(255,215,0,0.2);
          transform: scale(1.1);
        }

        .vision-icon {
          color: var(--gold);
        }

        .vision-card h3 {
          color: var(--gold);
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .vision-card p {
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* =============================================
           CTA SECTION
           ============================================= */
        .cta-section {
          background: linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,215,0,0.02));
          border: 1px solid rgba(255,215,0,0.1);
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          margin-top: 2rem;
        }

        .cta-content h2 {
          color: var(--gold);
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .cta-content p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .cta-btn {
          justify-content: center;
        }

        /* =============================================
           EMPTY STATE
           ============================================= */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: rgba(26,26,26,0.5);
          border-radius: 15px;
          border: 1px dashed rgba(255,215,0,0.3);
        }

        .empty-state svg {
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .empty-state .empty-sub {
          font-size: 0.9rem;
          color: #666;
        }

        /* =============================================
           LOADING
           ============================================= */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .loading-shimmer {
          background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        /* =============================================
           RESPONSIVE
           ============================================= */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.3rem;
          }

          .hero-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-divider {
            width: 40px;
            height: 1px;
          }

          .section-title {
            font-size: 2rem;
          }

          .vision-grid {
            grid-template-columns: 1fr;
          }

          .cta-content h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 2rem 1rem;
            min-height: 400px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .hero-buttons .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;