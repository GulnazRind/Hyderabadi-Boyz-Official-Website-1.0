import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { 
  RiTeamLine,
  RiUserStarLine,
  RiShieldStarLine,
  RiUserLine,
  RiTrophyLine,
  RiMedalLine,
  RiStarLine,
  RiUserHeartLine
} from '@remixicon/react';

const Gallery = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_players')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'captain':
        return <RiUserStarLine size={24} color="#FFD700" />;
      case 'sub_captain':
        return <RiShieldStarLine size={24} color="#DAA520" />;
      case 'management':
        return <RiUserHeartLine size={24} color="#00b894" />;
      default:
        return <RiUserLine size={24} color="#888" />;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'captain':
        return { label: 'Captain', color: '#FFD700', bg: 'rgba(255,215,0,0.2)' };
      case 'sub_captain':
        return { label: 'Sub-Captain', color: '#DAA520', bg: 'rgba(218,165,32,0.2)' };
      case 'management':
        return { label: 'Management', color: '#00b894', bg: 'rgba(0,184,148,0.2)' };
      default:
        return { label: 'Player', color: '#888', bg: 'rgba(136,136,136,0.2)' };
    }
  };

  const filteredPlayers = selectedRole === 'all' 
    ? players 
    : players.filter(p => p.role === selectedRole);

  const roles = ['all', 'captain', 'sub_captain', 'management', 'player'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#FFD700' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading players...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
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
          <RiTeamLine size={32} />
          Our Players
        </h2>
        <p style={{ color: '#aaa' }}>
          Meet the Hyderabadi Boyz family
        </p>
      </div>

      {/* Role Filter */}
      {players.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                border: selectedRole === role ? '2px solid #FFD700' : '1px solid #333',
                background: selectedRole === role ? 'rgba(255,215,0,0.2)' : 'transparent',
                color: selectedRole === role ? '#FFD700' : '#888',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'capitalize'
              }}
            >
              {role === 'all' ? 'All' : role.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* No Players */}
      {players.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '15px',
          border: '1px dashed rgba(255,215,0,0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <RiTeamLine size={48} color="#FFD700" />
          </div>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>
            No players added yet. Check back soon!
          </p>
        </div>
      )}

      {/* Players Grid */}
      {filteredPlayers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {filteredPlayers.map((player, index) => {
            const badge = getRoleBadge(player.role);
            return (
              <div
                key={player.id}
                className="player-card animate-fadeInUp"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  background: 'rgba(26,26,46,0.95)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: `2px solid ${player.role === 'captain' ? '#FFD700' : 
                           player.role === 'sub_captain' ? '#DAA520' : 
                           player.role === 'management' ? '#00b894' : 
                           'rgba(255,215,0,0.1)'}`,
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 15px 40px ${badge.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Role Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  zIndex: 2,
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  background: badge.bg,
                  color: badge.color,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  border: `1px solid ${badge.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {getRoleIcon(player.role)}
                  {badge.label}
                </div>

                {/* Image */}
                <div style={{
                  width: '100%',
                  height: '280px',
                  overflow: 'hidden',
                  background: '#0a0a0a',
                  position: 'relative'
                }}>
                  {player.image_url ? (
                    <img 
                      src={player.image_url} 
                      alt={player.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,215,0,0.05)',
                      color: '#555',
                      fontSize: '4rem'
                    }}>
                      <RiUserLine size={64} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    color: player.role === 'captain' ? '#FFD700' : 
                           player.role === 'sub_captain' ? '#DAA520' : 
                           player.role === 'management' ? '#00b894' : '#fff',
                    fontSize: '1.2rem',
                    marginBottom: '0.3rem'
                  }}>
                    {player.name}
                  </h3>
                  
                  {player.weight_category && (
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                      <RiTrophyLine size={14} style={{ verticalAlign: 'middle' }} />
                      {player.weight_category}
                    </p>
                  )}
                  
                  {player.experience && (
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                      <RiStarLine size={14} style={{ verticalAlign: 'middle' }} />
                      {player.experience}
                    </p>
                  )}
                  
                  {player.description && (
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {player.description}
                    </p>
                  )}
                  
                  {player.achievements && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(255,215,0,0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,215,0,0.1)'
                    }}>
                      <p style={{ color: '#FFD700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <RiMedalLine size={14} />
                        {player.achievements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;