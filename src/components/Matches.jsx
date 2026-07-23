import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  RiFileListLine,
  RiTrophyLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiUser3Line,
  RiFilterLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiMedalLine,
  RiTeamLine
} from '@remixicon/react';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMatches(data || []);
      
      const uniqueCategories = [...new Set(data?.map(m => m.category) || [])];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = selectedCategory === 'all' 
    ? matches 
    : matches.filter(m => m.category === selectedCategory);

  const pendingMatches = filteredMatches.filter(m => m.status !== 'completed');
  const completedMatches = filteredMatches.filter(m => m.status === 'completed');

  const getTimeAgo = (date) => {
    const now = new Date();
    const matchDate = new Date(date);
    const diff = Math.floor((now - matchDate) / (1000 * 60));
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem',
        color: '#FFD700'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header Section */}
      <div className="section-header" style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9))',
        padding: '2rem',
        borderRadius: '15px',
        border: '1px solid rgba(255,215,0,0.2)',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#FFD700',
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <RiFileListLine size={32} />
          Matches
        </h2>
        <p style={{ color: '#aaa' }}>
          View all matches and results
        </p>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{
          background: 'rgba(26,26,46,0.8)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid rgba(255,215,0,0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = '#FFD700';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,215,0,0.1)';
        }}>
          <div style={{ fontSize: '2rem', color: '#FFD700' }}>
            <RiFileListLine size={32} />
          </div>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>Total Matches</div>
          <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {matches.length}
          </div>
        </div>
        <div className="stat-card" style={{
          background: 'rgba(26,26,46,0.8)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid rgba(255,215,0,0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = '#f39c12';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,215,0,0.1)';
        }}>
          <div style={{ fontSize: '2rem', color: '#f39c12' }}>
            <RiTimeLine size={32} />
          </div>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>Pending</div>
          <div style={{ color: '#f39c12', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {pendingMatches.length}
          </div>
        </div>
        <div className="stat-card" style={{
          background: 'rgba(26,26,46,0.8)',
          padding: '1rem',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid rgba(255,215,0,0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = '#2ecc71';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,215,0,0.1)';
        }}>
          <div style={{ fontSize: '2rem', color: '#2ecc71' }}>
            <RiCheckLine size={32} />
          </div>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>Completed</div>
          <div style={{ color: '#2ecc71', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {completedMatches.length}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '20px',
              border: selectedCategory === 'all' ? '2px solid #FFD700' : '1px solid #333',
              background: selectedCategory === 'all' ? 'rgba(255,215,0,0.2)' : 'transparent',
              color: selectedCategory === 'all' ? '#FFD700' : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <RiFilterLine size={16} />
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                border: selectedCategory === cat ? '2px solid #FFD700' : '1px solid #333',
                background: selectedCategory === cat ? 'rgba(255,215,0,0.2)' : 'transparent',
                color: selectedCategory === cat ? '#FFD700' : '#888',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* No Matches Message */}
      {filteredMatches.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '15px',
          border: '1px dashed rgba(255,215,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <RiFileListLine size={48} color="#FFD700" />
          </div>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            No matches available in this category
          </p>
        </div>
      )}

      {/* Matches Grid */}
      {filteredMatches.length > 0 && (
        <div>
          {/* Pending Matches */}
          {pendingMatches.length > 0 && (
            <>
              <h3 style={{
                color: '#f39c12',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <RiTimeLine size={24} />
                Pending Matches
                <span style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  fontWeight: 'normal'
                }}>
                  ({pendingMatches.length})
                </span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {pendingMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="match-card animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,215,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.2rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        background: 'rgba(243,156,18,0.2)',
                        color: '#f39c12',
                        border: '1px solid rgba(243,156,18,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <RiTimeLine size={12} />
                        Pending
                      </span>
                      <span style={{ color: '#888', fontSize: '0.8rem' }}>
                        <RiCalendarLine size={14} style={{ verticalAlign: 'middle' }} />
                        {getTimeAgo(match.created_at)}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem 0',
                      margin: '0.5rem 0'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUserLine size={18} color="#FFD700" />
                          {match.player1_name}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>Player 1</div>
                      </div>
                      <div style={{
                        color: '#FFD700',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        VS
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUser3Line size={18} color="#FFD700" />
                          {match.player2_name}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>Player 2</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>
                        <RiTrophyLine size={14} style={{ verticalAlign: 'middle' }} />
                        {match.category}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>
                        #ID {match.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Completed Matches */}
          {completedMatches.length > 0 && (
            <>
              <h3 style={{
                color: '#2ecc71',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <RiCheckLine size={24} />
                Completed Matches
                <span style={{
                  fontSize: '0.8rem',
                  color: '#888',
                  fontWeight: 'normal'
                }}>
                  ({completedMatches.length})
                </span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {completedMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="match-card animate-fadeInUp"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      border: '2px solid rgba(46,204,113,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(46,204,113,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.2rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        background: 'rgba(46,204,113,0.2)',
                        color: '#2ecc71',
                        border: '1px solid rgba(46,204,113,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <RiCheckLine size={12} />
                        Completed
                      </span>
                      <span style={{ color: '#888', fontSize: '0.8rem' }}>
                        <RiCalendarLine size={14} style={{ verticalAlign: 'middle' }} />
                        {getTimeAgo(match.completed_at || match.created_at)}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem 0',
                      margin: '0.5rem 0'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: match.winner === match.player1_name ? '#FFD700' : '#888',
                          fontSize: '1.1rem',
                          fontWeight: match.winner === match.player1_name ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUserLine size={18} color={match.winner === match.player1_name ? '#FFD700' : '#666'} />
                          {match.player1_name}
                          {match.winner === match.player1_name && ' 🏆'}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>Player 1</div>
                      </div>
                      <div style={{
                        color: '#555',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        VS
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          color: match.winner === match.player2_name ? '#FFD700' : '#888',
                          fontSize: '1.1rem',
                          fontWeight: match.winner === match.player2_name ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUser3Line size={18} color={match.winner === match.player2_name ? '#FFD700' : '#666'} />
                          {match.player2_name}
                          {match.winner === match.player2_name && ' 🏆'}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>Player 2</div>
                      </div>
                    </div>

                    {match.winner && (
                      <div style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,215,0,0.2)',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <RiTrophyLine size={20} color="#FFD700" />
                        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                          Winner: {match.winner}
                        </span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>
                        <RiTrophyLine size={14} style={{ verticalAlign: 'middle' }} />
                        {match.category}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>
                        #ID {match.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Matches;