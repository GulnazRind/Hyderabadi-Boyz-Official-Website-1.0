import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, STORAGE_BUCKET } from '../utils/supabaseClient';
import { 
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiUserStarLine,
  RiShieldStarLine,
  RiUserHeartLine,
  RiUserLine,
  RiUploadLine,
  RiCloseLine,
  RiCheckLine,
  RiImageAddLine
} from '@remixicon/react';

const AdminGallery = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    role: 'player',
    description: '',
    weight_category: '',
    experience: '',
    achievements: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    fetchPlayers();
  }, [navigate]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_players')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `players/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      let imageUrl = editingPlayer?.image_url || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const playerData = {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        weight_category: formData.weight_category,
        experience: formData.experience,
        achievements: formData.achievements,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingPlayer) {
        result = await supabase
          .from('gallery_players')
          .update(playerData)
          .eq('id', editingPlayer.id);
      } else {
        result = await supabase
          .from('gallery_players')
          .insert([{ ...playerData, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      setSuccess(editingPlayer ? 'Player updated successfully!' : 'Player added successfully!');
      resetForm();
      await fetchPlayers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving player:', error);
      setError('Failed to save player: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const { error } = await supabase
        .from('gallery_players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      await fetchPlayers();
      setSuccess('Player deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting player:', error);
      setError('Failed to delete player');
    }
  };

  const editPlayer = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      role: player.role,
      description: player.description || '',
      weight_category: player.weight_category || '',
      experience: player.experience || '',
      achievements: player.achievements || '',
      display_order: player.display_order || 0,
      is_active: player.is_active !== false
    });
    setImagePreview(player.image_url || '');
    setImageFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData({
      name: '',
      role: 'player',
      description: '',
      weight_category: '',
      experience: '',
      achievements: '',
      display_order: 0,
      is_active: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'captain': return 'Captain';
      case 'sub_captain': return 'Sub-Captain';
      case 'management': return 'Management';
      default: return 'Player';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'captain': return '#FFD700';
      case 'sub_captain': return '#DAA520';
      case 'management': return '#00b894';
      default: return '#888';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#FFD700' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ color: '#FFD700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiUserStarLine size={32} />
          Gallery Management
        </h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RiAddLine size={20} />
          Add Player
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          background: 'rgba(231,76,60,0.2)',
          border: '1px solid #e74c3c',
          color: '#e74c3c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>
            <RiCloseLine size={20} />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          background: 'rgba(46,204,113,0.2)',
          border: '1px solid #2ecc71',
          color: '#2ecc71',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <RiCheckLine size={20} />
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: 'rgba(26,26,46,0.95)',
          padding: '2rem',
          borderRadius: '15px',
          border: '1px solid rgba(255,215,0,0.2)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '1.5rem' }}>
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Player name"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="player">Player</option>
                  <option value="captain">Captain</option>
                  <option value="sub_captain">Sub-Captain</option>
                  <option value="management">Management</option>
                </select>
              </div>
              <div className="form-group">
                <label>Weight Category</label>
                <input
                  type="text"
                  value={formData.weight_category}
                  onChange={(e) => setFormData({...formData, weight_category: e.target.value})}
                  placeholder="e.g., 70-80 kg"
                />
              </div>
              <div className="form-group">
                <label>Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g., 5 years"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Player description..."
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Achievements</label>
              <input
                type="text"
                value={formData.achievements}
                onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                placeholder="e.g., 2x National Champion"
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Active</label>
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Player Image</label>
              <div style={{
                border: '2px dashed rgba(255,215,0,0.3)',
                borderRadius: '10px',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: imagePreview ? 'rgba(255,215,0,0.05)' : 'transparent'
              }}
              onClick={() => document.getElementById('imageInput').click()}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'}
              >
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                {imagePreview ? (
                  <div>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '10px',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                      <RiImageAddLine size={16} style={{ verticalAlign: 'middle' }} />
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div>
                    <RiUploadLine size={40} color="#FFD700" />
                    <p style={{ color: '#888', marginTop: '0.5rem' }}>
                      Click to upload image
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Saving...' : (editingPlayer ? 'Update Player' : 'Add Player')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players List */}
      <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>
        All Players ({players.length})
      </h3>

      {players.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(26,26,46,0.5)',
          borderRadius: '15px',
          border: '1px dashed rgba(255,215,0,0.3)'
        }}>
          <p style={{ color: '#888' }}>No players added yet. Add your first player!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {players.map(player => (
            <div
              key={player.id}
              style={{
                background: 'rgba(26,26,46,0.9)',
                borderRadius: '15px',
                overflow: 'hidden',
                border: `2px solid ${getRoleColor(player.role)}`,
                transition: 'all 0.3s ease'
              }}
            >
              {player.image_url ? (
                <img 
                  src={player.image_url} 
                  alt={player.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,215,0,0.05)',
                  color: '#555'
                }}>
                  <RiUserLine size={48} />
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ color: '#FFD700' }}>{player.name}</h4>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: `rgba(${getRoleColor(player.role)},0.2)`,
                    color: getRoleColor(player.role),
                    border: `1px solid ${getRoleColor(player.role)}`
                  }}>
                    {getRoleLabel(player.role)}
                  </span>
                </div>
                {player.weight_category && (
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>
                    {player.weight_category}
                  </p>
                )}
                {player.is_active === false && (
                  <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>Inactive</span>
                )}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => editPlayer(player)}
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <RiEditLine size={16} />
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deletePlayer(player.id)}
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <RiDeleteBinLine size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;