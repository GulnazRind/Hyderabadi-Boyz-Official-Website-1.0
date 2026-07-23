import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { 
  RiTrophyLine,
  RiUserLine,
  RiUser3Line,
  RiSwordLine,
  RiDiceLine,
  RiImageLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldStarLine,
  RiTeamLine,
  RiUserStarLine,
  RiUserHeartLine
} from '@remixicon/react';

const AdminPanel = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tournaments');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [matchResult, setMatchResult] = useState({ matchId: '', winner: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoDeleteDays, setAutoDeleteDays] = useState(2);
  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    category: '',
    description: '',
    duration_hours: 4,
    status: 'upcoming'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    fetchAllData();
    
    const deleteInterval = setInterval(() => {
      deleteOldCompletedMatches();
    }, 3600000);
    
    const statusInterval = setInterval(() => {
      updateTournamentStatuses();
    }, 60000);
    
    return () => {
      clearInterval(deleteInterval);
      clearInterval(statusInterval);
    };
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('registration_date', { ascending: false });

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;
      setTournaments(tournamentsData || []);
      
      await updateTournamentStatuses();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentStatuses = async () => {
    try {
      const now = new Date();
      
      for (const tournament of tournaments) {
        if (!tournament.date || !tournament.time) continue;
        
        const startDateTime = new Date(`${tournament.date}T${tournament.time}`);
        const endDateTime = new Date(startDateTime.getTime() + (tournament.duration_hours || 4) * 60 * 60 * 1000);
        
        let newStatus = tournament.status;
        
        if (now < startDateTime) {
          newStatus = 'upcoming';
        } else if (now >= startDateTime && now <= endDateTime) {
          newStatus = 'active';
        } else if (now > endDateTime) {
          newStatus = 'completed';
        }
        
        if (newStatus !== tournament.status) {
          const { error } = await supabase
            .from('tournaments')
            .update({ status: newStatus })
            .eq('id', tournament.id);
            
          if (error) throw error;
        }
      }
      
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTournaments(tournamentsData || []);
      
    } catch (error) {
      console.error('Error updating statuses:', error);
    }
  };

  const deleteOldCompletedMatches = async () => {
    try {
      const now = new Date();
      const daysToKeep = autoDeleteDays || 2;
      const cutoffDate = new Date(now.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('matches')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', cutoffDate.toISOString());

      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`🗑️ Deleted ${data.length} old completed matches`);
        await fetchAllData();
      }
      
    } catch (error) {
      console.error('Error deleting old matches:', error);
    }
  };

  const addTournament = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!newTournament.name || !newTournament.date || !newTournament.time || 
          !newTournament.location || !newTournament.category) {
        throw new Error('Please fill all required fields');
      }

      const startDateTime = new Date(`${newTournament.date}T${newTournament.time}`);

      const { data, error } = await supabase
        .from('tournaments')
        .insert([
          {
            name: newTournament.name,
            date: newTournament.date,
            time: newTournament.time,
            location: newTournament.location,
            category: newTournament.category,
            description: newTournament.description || '',
            duration_hours: parseInt(newTournament.duration_hours) || 4,
            start_datetime: startDateTime.toISOString(),
            status: 'upcoming'
          }
        ]);

      if (error) throw error;

      setNewTournament({
        name: '',
        date: '',
        time: '',
        location: '',
        category: '',
        description: '',
        duration_hours: 4,
        status: 'upcoming'
      });
      
      await fetchAllData();
      setSuccess('✅ Tournament added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error adding tournament:', error);
      setError('❌ Failed to add tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;
      
      await fetchAllData();
      setSuccess('✅ Tournament deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setError('❌ Failed to delete tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentStatus = async (tournamentId, status) => {
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase
        .from('tournaments')
        .update({ status })
        .eq('id', tournamentId);

      if (error) throw error;
      
      await fetchAllData();
      setSuccess('✅ Tournament status updated!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error updating tournament:', error);
      setError('❌ Failed to update tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    if (!selectedCategory) {
      setError('Please select a weight category');
      return;
    }

    const categoryPlayers = players.filter(
      p => p.weightcategory === selectedCategory && p.status === 'approved'
    );

    if (categoryPlayers.length < 2) {
      setError('Need at least 2 approved players in this category');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const { data: existingMatches, error: fetchError } = await supabase
        .from('matches')
        .select('player1_name, player2_name, status')
        .eq('category', selectedCategory);

      if (fetchError) throw fetchError;

      const existingPairs = new Set();
      existingMatches?.forEach(match => {
        const pair1 = `${match.player1_name}|${match.player2_name}`;
        const pair2 = `${match.player2_name}|${match.player1_name}`;
        existingPairs.add(pair1);
        existingPairs.add(pair2);
      });

      const shuffled = [...categoryPlayers].sort(() => Math.random() - 0.5);
      const matchPairs = [];
      const usedPlayers = new Set();

      for (let i = 0; i < shuffled.length; i++) {
        if (usedPlayers.has(shuffled[i].id)) continue;

        let matched = false;
        for (let j = i + 1; j < shuffled.length; j++) {
          if (usedPlayers.has(shuffled[j].id)) continue;

          const pairKey1 = `${shuffled[i].fullname}|${shuffled[j].fullname}`;
          const pairKey2 = `${shuffled[j].fullname}|${shuffled[i].fullname}`;

          if (!existingPairs.has(pairKey1) && !existingPairs.has(pairKey2)) {
            matchPairs.push([shuffled[i], shuffled[j]]);
            usedPlayers.add(shuffled[i].id);
            usedPlayers.add(shuffled[j].id);
            matched = true;
            break;
          }
        }

        if (!matched) {
          console.log(`⚠️ No unique opponent found for ${shuffled[i].fullname}`);
        }
      }

      if (matchPairs.length === 0) {
        setError('No new unique matches can be generated!');
        setLoading(false);
        return;
      }

      let insertedCount = 0;
      for (const pair of matchPairs) {
        const { error } = await supabase
          .from('matches')
          .insert([
            {
              player1_id: pair[0].id,
              player1_name: pair[0].fullname,
              player2_id: pair[1].id,
              player2_name: pair[1].fullname,
              category: selectedCategory,
              status: 'pending',
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
        insertedCount++;
      }

      await fetchAllData();
      setSuccess(`✅ ${insertedCount} new unique matches generated! Auto-delete after ${autoDeleteDays} day(s).`);
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Error generating matches:', error);
      setError('❌ Failed to generate matches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchResult = async (matchId, winnerName) => {
    if (!winnerName) {
      setError('Please select a winner');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          winner: winnerName, 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;
      
      await fetchAllData();
      setMatchResult({ matchId: '', winner: '' });
      setSuccess(`✅ ${winnerName} is the winner! Match will auto-delete in ${autoDeleteDays} day(s).`);
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error updating match result:', error);
      setError('❌ Failed to update match result: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approvePlayer = async (playerId) => {
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase
        .from('players')
        .update({ status: 'approved' })
        .eq('id', playerId);

      if (error) throw error;
      await fetchAllData();
      setSuccess('✅ Player approved!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error approving player:', error);
      setError('❌ Failed to approve player: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      setError('');
      setLoading(true);
      
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      await fetchAllData();
      setSuccess('✅ Player deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting player:', error);
      setError('❌ Failed to delete player: ' + error.message);
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

  const getTimeUntilDeletion = (match) => {
    if (!match.completed_at) return null;
    
    const completedDate = new Date(match.completed_at);
    const deletionDate = new Date(completedDate.getTime() + (autoDeleteDays * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diff = deletionDate - now;
    
    if (diff <= 0) return 'Deleting soon...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const isMatchExpiring = (match) => {
    if (!match.completed_at) return false;
    
    const completedDate = new Date(match.completed_at);
    const deletionDate = new Date(completedDate.getTime() + (autoDeleteDays * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diff = deletionDate - now;
    
    return diff < 24 * 60 * 60 * 1000;
  };

  if (loading && tournaments.length === 0 && players.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem', 
        color: '#FFD700',
        fontSize: '1.5rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        Loading admin panel...
      </div>
    );
  }

  const weightCategories = [...new Set(players.map(p => p.weightcategory))];

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
        padding: '2rem',
        borderRadius: '15px',
        border: '2px solid #FFD700',
        marginBottom: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
          animation: 'spin 20s linear infinite'
        }} />
        <h2 style={{
          fontSize: '2.5rem',
          color: '#FFD700',
          margin: 0,
          position: 'relative',
          textShadow: '0 0 30px rgba(255,215,0,0.3)'
        }}>
          <RiShieldStarLine size={32} style={{ verticalAlign: 'middle' }} />
          Admin Dashboard
        </h2>
        <p style={{ color: '#aaa', marginTop: '0.5rem', position: 'relative' }}>
          Manage tournaments, players, matches and gallery
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          background: 'rgba(231, 76, 60, 0.2)',
          border: '1px solid #e74c3c',
          color: '#e74c3c',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#e74c3c',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          background: 'rgba(46, 204, 113, 0.2)',
          border: '1px solid #2ecc71',
          color: '#2ecc71',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <RiCheckLine size={20} />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'tournaments', icon: <RiTrophyLine size={22} />, label: 'Tournaments', count: tournaments.length },
          { id: 'players', icon: <RiUserLine size={22} />, label: 'Players', count: players.length },
          { id: 'matches', icon: <RiSwordLine size={22} />, label: 'Matches', count: matches.length },
          { id: 'generate', icon: <RiDiceLine size={22} />, label: 'Generate', count: '' },
          { id: 'gallery', icon: <RiImageLine size={22} />, label: 'Gallery', count: '' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #FFD700, #DAA520)'
                : 'rgba(26, 26, 26, 0.8)',
              color: activeTab === tab.id ? '#0a0a0a' : '#FFD700',
              border: activeTab === tab.id ? 'none' : '2px solid #FFD700',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? '0 5px 20px rgba(255,215,0,0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== '' && (
              <span style={{
                display: 'inline-block',
                marginLeft: '0.3rem',
                background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,215,0,0.2)',
                padding: '0.1rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.8rem'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* =============================================
          TOURNAMENTS TAB
          ============================================= */}
      {activeTab === 'tournaments' && (
        <div>
          {/* Add Tournament Form */}
          <div style={{
            background: 'rgba(26, 26, 26, 0.95)',
            padding: '2rem',
            borderRadius: '15px',
            border: '1px solid rgba(255,215,0,0.2)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: '#FFD700',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <RiAddLine size={24} />
              Create New Tournament
            </h3>
            <form onSubmit={addTournament}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Tournament Name *</label>
                  <input
                    type="text"
                    value={newTournament.name}
                    onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                    required
                    placeholder="e.g., Mini Junior Championship"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Date *</label>
                  <input
                    type="date"
                    value={newTournament.date}
                    onChange={(e) => setNewTournament({...newTournament, date: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Time *</label>
                  <input
                    type="time"
                    value={newTournament.time}
                    onChange={(e) => setNewTournament({...newTournament, time: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Location *</label>
                  <input
                    type="text"
                    value={newTournament.location}
                    onChange={(e) => setNewTournament({...newTournament, location: e.target.value})}
                    required
                    placeholder="e.g., Hyderabad Sports Complex"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Category *</label>
                  <input
                    type="text"
                    value={newTournament.category}
                    onChange={(e) => setNewTournament({...newTournament, category: e.target.value})}
                    required
                    placeholder="e.g., Junior, Senior"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#FFD700' }}>Duration (Hours) *</label>
                  <input
                    type="number"
                    value={newTournament.duration_hours}
                    onChange={(e) => setNewTournament({...newTournament, duration_hours: e.target.value})}
                    required
                    min="1"
                    max="24"
                    placeholder="4"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label style={{ color: '#FFD700' }}>Description</label>
                <textarea
                  value={newTournament.description}
                  onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                  placeholder="Tournament details..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginTop: '1.5rem',
                  background: 'linear-gradient(135deg, #FFD700, #DAA520)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0a0a0a',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                disabled={loading}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {loading ? '⏳ Creating...' : <><RiAddLine size={20} /> Create Tournament</>}
              </button>
            </form>
          </div>

          {/* Tournaments List */}
          <h3 style={{
            color: '#FFD700',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <RiTrophyLine size={24} />
            All Tournaments ({tournaments.length})
          </h3>
          
          {tournaments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(26,26,26,0.5)',
              borderRadius: '15px',
              border: '1px dashed rgba(255,215,0,0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <p style={{ color: '#888', fontSize: '1.1rem' }}>
                No tournaments yet. Create your first tournament above!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '1.5rem'
            }}>
              {tournaments.map(tournament => {
                const timeRemaining = getTimeRemaining(tournament);
                return (
                  <div
                    key={tournament.id}
                    style={{
                      background: 'rgba(26, 26, 26, 0.95)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      border: `2px solid ${
                        tournament.status === 'active' ? '#2ecc71' : 
                        tournament.status === 'completed' ? '#3498db' : 
                        '#FFD700'
                      }`,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,215,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      padding: '0.5rem 1rem',
                      background: tournament.status === 'active' ? '#2ecc71' :
                                tournament.status === 'completed' ? '#3498db' : '#f39c12',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      borderRadius: '0 15px 0 15px'
                    }}>
                      {tournament.status === 'active' ? '▶️ Active' : 
                       tournament.status === 'completed' ? '✅ Completed' : '📅 Upcoming'}
                    </div>
                    
                    <h3 style={{
                      color: '#FFD700',
                      fontSize: '1.3rem',
                      marginBottom: '0.5rem',
                      paddingRight: '80px'
                    }}>
                      <RiTrophyLine size={20} style={{ verticalAlign: 'middle' }} />
                      {tournament.name}
                    </h3>
                    
                    <div style={{ color: '#ccc', lineHeight: '1.8' }}>
                      <p>
                        <RiCalendarLine size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {new Date(tournament.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p>
                        <RiTimeLine size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {tournament.time}
                      </p>
                      <p>
                        <RiMapPinLine size={16} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                        {tournament.location}
                      </p>
                      <p><strong>Category:</strong> {tournament.category}</p>
                      <p><strong>Duration:</strong> {tournament.duration_hours || 4} hours</p>
                      {tournament.description && (
                        <p style={{ color: '#888' }}>{tournament.description}</p>
                      )}
                    </div>

                    {tournament.status === 'upcoming' && timeRemaining && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.8rem',
                        background: 'rgba(255,215,0,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,215,0,0.2)',
                        textAlign: 'center'
                      }}>
                        <RiTimeLine size={18} style={{ verticalAlign: 'middle' }} />
                        <span style={{ color: '#888' }}> Time Remaining: </span>
                        <span style={{ 
                          color: '#FFD700', 
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          {timeRemaining}
                        </span>
                      </div>
                    )}

                    {tournament.status === 'active' && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.8rem',
                        background: 'rgba(46, 204, 113, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid #2ecc71',
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                          🔴 Tournament is LIVE!
                        </span>
                      </div>
                    )}

                    {tournament.status === 'completed' && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.8rem',
                        background: 'rgba(52, 152, 219, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid #3498db',
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                          ✅ Tournament Completed
                        </span>
                      </div>
                    )}
                    
                    <div style={{
                      marginTop: '1.5rem',
                      display: 'flex',
                      gap: '0.8rem',
                      flexWrap: 'wrap',
                      borderTop: '1px solid rgba(255,215,0,0.1)',
                      paddingTop: '1.5rem'
                    }}>
                      <button 
                        onClick={() => {
                          window.location.href = `/register?tournament=${tournament.id}`;
                        }}
                        style={{
                          flex: 1,
                          padding: '0.7rem',
                          background: 'linear-gradient(135deg, #FFD700, #DAA520)',
                          color: '#0a0a0a',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <RiUserAddLine size={16} style={{ verticalAlign: 'middle' }} />
                        Register Now
                      </button>
                      
                      <select
                        value={tournament.status}
                        onChange={(e) => updateTournamentStatus(tournament.id, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          background: '#0a0a0a',
                          color: 'white',
                          border: '1px solid #FFD700',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="upcoming">📅 Upcoming</option>
                        <option value="active">▶️ Active</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                      <button 
                        onClick={() => deleteTournament(tournament.id)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'rgba(231, 76, 60, 0.2)',
                          color: '#e74c3c',
                          border: '1px solid #e74c3c',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontWeight: '600'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#e74c3c';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                          e.target.style.color = '#e74c3c';
                        }}
                      >
                        <RiDeleteBinLine size={16} style={{ verticalAlign: 'middle' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================
          PLAYERS TAB
          ============================================= */}
      {activeTab === 'players' && (
        <div>
          <h3 style={{ 
            color: '#FFD700', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <RiUserLine size={24} />
            Registered Players ({players.length})
          </h3>
          
          {players.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(26,26,26,0.5)',
              borderRadius: '15px',
              border: '1px dashed rgba(255,215,0,0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p style={{ color: '#888', fontSize: '1.1rem' }}>
                No players registered yet.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {players.map(player => (
                <div
                  key={player.id}
                  style={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: `1px solid ${player.status === 'approved' ? '#2ecc71' : 'rgba(255,215,0,0.2)'}`,
                    transition: 'all 0.3s ease'
                  }}
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
                    alignItems: 'start',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      color: '#FFD700',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <RiUserLine size={18} />
                      {player.fullname}
                    </h3>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: player.status === 'approved' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(243, 156, 18, 0.2)',
                      color: player.status === 'approved' ? '#2ecc71' : '#f39c12',
                      border: `1px solid ${player.status === 'approved' ? '#2ecc71' : '#f39c12'}`
                    }}>
                      {player.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div style={{ color: '#ccc', lineHeight: '2' }}>
                    <p><RiUser3Line size={14} style={{ verticalAlign: 'middle' }} /> Father: {player.fathername || 'N/A'}</p>
                    <p><RiUserLine size={14} style={{ verticalAlign: 'middle' }} /> CNIC: {player.cnic}</p>
                    <p><RiPhoneLine size={14} style={{ verticalAlign: 'middle' }} /> {player.phone}</p>
                    <p><RiScaleLine size={14} style={{ verticalAlign: 'middle' }} /> {player.weightcategory}</p>
                    <p><RiStarLine size={14} style={{ verticalAlign: 'middle' }} /> {player.experience}</p>
                    <p><RiTeamLine size={14} style={{ verticalAlign: 'middle' }} /> {player.interestedinteam}</p>
                  </div>
                  
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    borderTop: '1px solid rgba(255,215,0,0.1)',
                    paddingTop: '1rem'
                  }}>
                    {player.status !== 'approved' && (
                      <button 
                        onClick={() => approvePlayer(player.id)}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          background: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#27ae60'}
                        onMouseLeave={(e) => e.target.style.background = '#2ecc71'}
                      >
                        <RiCheckLine size={16} />
                        Approve
                      </button>
                    )}
                    <button 
                      onClick={() => deletePlayer(player.id)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(231, 76, 60, 0.2)',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#e74c3c';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                        e.target.style.color = '#e74c3c';
                      }}
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============================================
          MATCHES TAB
          ============================================= */}
      {activeTab === 'matches' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h3 style={{ 
              color: '#FFD700', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <RiSwordLine size={24} />
              All Matches ({matches.length})
            </h3>
            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,215,0,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255,215,0,0.2)'
            }}>
              <RiTimeLine size={16} style={{ verticalAlign: 'middle' }} />
              <span style={{ color: '#888' }}> Auto-delete after: </span>
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                {autoDeleteDays} day{autoDeleteDays > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {matches.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(26,26,26,0.5)',
              borderRadius: '15px',
              border: '1px dashed rgba(255,215,0,0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
              <p style={{ color: '#888', fontSize: '1.1rem' }}>
                No matches generated yet. Go to "Generate" tab!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {matches.map(match => {
                const expiring = isMatchExpiring(match);
                const timeLeft = getTimeUntilDeletion(match);
                
                return (
                  <div
                    key={match.id}
                    style={{
                      background: 'rgba(26, 26, 26, 0.95)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      border: match.status === 'completed' 
                        ? (expiring ? '2px solid #e74c3c' : '1px solid #2ecc71')
                        : '1px solid rgba(255,215,0,0.2)',
                      transition: 'all 0.3s ease',
                      opacity: match.status === 'completed' && expiring ? 0.7 : 1
                    }}
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
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ color: '#FFD700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <RiSwordLine size={18} />
                        Match
                      </h3>
                      <span style={{
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: match.status === 'completed' 
                          ? (expiring ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)')
                          : 'rgba(243, 156, 18, 0.2)',
                        color: match.status === 'completed' 
                          ? (expiring ? '#e74c3c' : '#2ecc71')
                          : '#f39c12',
                        border: `1px solid ${match.status === 'completed' 
                          ? (expiring ? '#e74c3c' : '#2ecc71')
                          : '#f39c12'}`
                      }}>
                        {match.status === 'completed' 
                          ? (expiring ? '⚠️ Expiring Soon' : '✅ Completed')
                          : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '10px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: match.winner === match.player1_name ? '#FFD700' : '#FFFFFF',
                          fontWeight: match.winner === match.player1_name ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUserLine size={16} />
                          {match.player1_name}
                          {match.winner === match.player1_name && ' 🏆'}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Player 1</div>
                      </div>
                      <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 'bold' }}>VS</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: match.winner === match.player2_name ? '#FFD700' : '#FFFFFF',
                          fontWeight: match.winner === match.player2_name ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}>
                          <RiUser3Line size={16} />
                          {match.player2_name}
                          {match.winner === match.player2_name && ' 🏆'}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Player 2</div>
                      </div>
                    </div>
                    
                    <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>
                      <RiTrophyLine size={14} style={{ verticalAlign: 'middle' }} />
                      Category: <span style={{ color: '#FFD700' }}>{match.category}</span>
                    </p>
                    
                    {match.status === 'completed' && match.completed_at && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: expiring ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                        borderRadius: '8px',
                        border: `1px solid ${expiring ? '#e74c3c' : '#2ecc71'}`,
                        textAlign: 'center'
                      }}>
                        <RiTimeLine size={16} style={{ verticalAlign: 'middle' }} />
                        <span style={{ 
                          color: expiring ? '#e74c3c' : '#2ecc71',
                          fontSize: '0.9rem'
                        }}>
                          {expiring ? '⚠️ ' : '⏳ '}
                          {timeLeft || 'Deleting soon...'}
                        </span>
                      </div>
                    )}
                    
                    {match.status !== 'completed' && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: '1rem' }}>
                        <select 
                          onChange={(e) => setMatchResult({ matchId: match.id, winner: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '0.5rem',
                            background: '#0a0a0a',
                            color: 'white',
                            border: '1px solid #FFD700',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">👑 Select winner</option>
                          <option value={match.player1_name}>{match.player1_name}</option>
                          <option value={match.player2_name}>{match.player2_name}</option>
                        </select>
                        <button 
                          onClick={() => updateMatchResult(match.id, matchResult.winner)}
                          disabled={!matchResult.winner || loading}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: matchResult.winner ? 'linear-gradient(135deg, #FFD700, #DAA520)' : '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: matchResult.winner ? '#0a0a0a' : '#666',
                            fontWeight: 'bold',
                            cursor: matchResult.winner ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {loading ? '⏳ Updating...' : <><RiCheckLine size={18} /> Set Winner</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =============================================
          GENERATE MATCHES TAB
          ============================================= */}
      {activeTab === 'generate' && (
        <div style={{
          background: 'rgba(26, 26, 26, 0.95)',
          padding: '2.5rem',
          borderRadius: '15px',
          border: '1px solid rgba(255,215,0,0.2)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              <RiDiceLine size={64} color="#FFD700" />
            </div>
            <h3 style={{ color: '#FFD700', fontSize: '1.8rem' }}>Generate Random Matches</h3>
            <p style={{ color: '#888', marginTop: '0.5rem' }}>
              Create random matchups between approved players
            </p>
          </div>
          
          <div className="form-group">
            <label style={{ color: '#FFD700', display: 'block', marginBottom: '0.5rem' }}>
              <RiTimeLine size={16} style={{ verticalAlign: 'middle' }} />
              Auto-Delete Completed Matches After
            </label>
            <select 
              value={autoDeleteDays} 
              onChange={(e) => setAutoDeleteDays(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0a0a0a',
                color: 'white',
                border: '1px solid #FFD700',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <option value={1}>1 Day</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
            </select>
          </div>
          
          <div className="form-group">
            <label style={{ color: '#FFD700', display: 'block', marginBottom: '0.5rem' }}>
              <RiScaleLine size={16} style={{ verticalAlign: 'middle' }} />
              Select Weight Category
            </label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0a0a0a',
                color: 'white',
                border: '1px solid #FFD700',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose category</option>
              {weightCategories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                weightCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>
          
          <button 
            onClick={generateMatches}
            style={{
              width: '100%',
              padding: '1rem',
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, #FFD700, #DAA520)',
              border: 'none',
              borderRadius: '8px',
              color: '#0a0a0a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading || weightCategories.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading || weightCategories.length === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={loading || weightCategories.length === 0}
          >
            {loading ? '⏳ Generating...' : <><RiDiceLine size={20} /> Generate Matches</>}
          </button>
          
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(255,215,0,0.1)'
          }}>
            <p style={{ color: '#888', lineHeight: '1.8' }}>
              <span style={{ color: '#FFD700' }}>📌 Information:</span>
              <br />
              • Approved players: <span style={{ color: '#2ecc71' }}>{players.filter(p => p.status === 'approved').length}</span>
              <br />
              • Total players: <span style={{ color: '#FFD700' }}>{players.length}</span>
              <br />
              • Weight categories: <span style={{ color: '#FFD700' }}>{weightCategories.length}</span>
              <br />
              • Total matches: <span style={{ color: '#FFD700' }}>{matches.length}</span>
              <br />
              • Auto-delete after: <span style={{ color: '#FFD700' }}>{autoDeleteDays} day{autoDeleteDays > 1 ? 's' : ''}</span>
              <br />
              <span style={{ color: '#e74c3c', fontSize: '0.9rem' }}>
                ⚠️ Completed matches will be automatically deleted after {autoDeleteDays} day{autoDeleteDays > 1 ? 's' : ''}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* =============================================
          GALLERY TAB
          ============================================= */}
      {activeTab === 'gallery' && (
        <div style={{
          background: 'rgba(26, 26, 26, 0.95)',
          padding: '2.5rem',
          borderRadius: '15px',
          border: '1px solid rgba(255,215,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <RiImageLine size={64} color="#FFD700" />
          </div>
          <h3 style={{ color: '#FFD700', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Gallery Management
          </h3>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>
            Manage player images, roles, and profiles for the gallery section
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'rgba(255,215,0,0.05)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,215,0,0.1)'
            }}>
              <RiUserStarLine size={28} color="#FFD700" />
              <p style={{ color: '#FFD700', fontWeight: 'bold', marginTop: '0.3rem' }}>Captain</p>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>1 allowed</p>
            </div>
            <div style={{
              background: 'rgba(255,215,0,0.05)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,215,0,0.1)'
            }}>
              <RiShieldStarLine size={28} color="#DAA520" />
              <p style={{ color: '#DAA520', fontWeight: 'bold', marginTop: '0.3rem' }}>Sub-Captain</p>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>2 allowed</p>
            </div>
            <div style={{
              background: 'rgba(255,215,0,0.05)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,215,0,0.1)'
            }}>
              <RiUserHeartLine size={28} color="#00b894" />
              <p style={{ color: '#00b894', fontWeight: 'bold', marginTop: '0.3rem' }}>Management</p>
              <p style={{ color: '#888', fontSize: '0.8rem' }}>Unlimited</p>
            </div>
          </div>
          <Link 
            to="/admin-gallery" 
            className="btn btn-primary" 
            style={{ 
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RiImageLine size={20} />
            Go to Gallery Management
            <RiArrowRightLine size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;