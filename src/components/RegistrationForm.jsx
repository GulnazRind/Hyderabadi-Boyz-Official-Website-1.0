import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const RegistrationForm = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  
  const [formData, setFormData] = useState({
    fullname: '',
    fathername: '',
    cnic: '',
    dateofbirth: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    weightcategory: '',
    experience: '',
    dominantarm: '',
    previouscompetitions: '',
    whyarmwrestling: '',  // Fixed: was 'whyamwrestling'
    interestedinteam: 'yes',
    availability: '',
    tournamentid: tournamentId || ''
  });

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTournaments();
    if (tournamentId) {
      fetchTournamentDetails(tournamentId);
    }
  }, [tournamentId]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTournamentDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSelectedTournament(data);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  const weightCategories = ['55-60 kg', '60-70 kg', '70-80 kg', '80-90 kg', '90-100 kg', '100+ kg'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const dominantArms = ['Right', 'Left', 'Both'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'tournamentid') {
      fetchTournamentDetails(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Submitting form data:', formData);

      // Validate required fields
      if (!formData.fullname || !formData.cnic || !formData.dateofbirth || 
          !formData.phone || !formData.address || !formData.weightcategory || 
          !formData.experience || !formData.dominantarm || !formData.whyarmwrestling || 
          !formData.availability) {
        throw new Error('Please fill all required fields');
      }

      // Check if player already exists
      const { data: existingPlayer, error: checkError } = await supabase
        .from('players')
        .select('cnic')
        .eq('cnic', formData.cnic)
        .single();

      if (existingPlayer) {
        setMessage({ type: 'error', text: '❌ A player with this CNIC already exists!' });
        setLoading(false);
        return;
      }

      // Prepare data for insertion (using correct lowercase column names)
      const playerData = {
        fullname: formData.fullname.trim(),
        fathername: formData.fathername ? formData.fathername.trim() : '',
        cnic: formData.cnic.trim(),
        dateofbirth: formData.dateofbirth,
        phone: formData.phone.trim(),
        email: formData.email ? formData.email.trim() : '',
        address: formData.address.trim(),
        city: formData.city || 'Hyderabad',
        weightcategory: formData.weightcategory,
        experience: formData.experience,
        dominantarm: formData.dominantarm,
        previouscompetitions: formData.previouscompetitions ? formData.previouscompetitions.trim() : '',
        whyarmwrestling: formData.whyarmwrestling.trim(),  // Fixed: was 'whyamwrestling'
        interestedinteam: formData.interestedinteam,
        availability: formData.availability.trim(),
        tournamentid: formData.tournamentid || '',
        registration_date: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Inserting data:', playerData);

      // Insert new player
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Insert success:', data);

      setMessage({ 
        type: 'success', 
        text: `✅ Registration successful! Welcome to Hyderabadi Boyz!` 
      });
      
      // Reset form
      setFormData({
        fullname: '',
        fathername: '',
        cnic: '',
        dateofbirth: '',
        phone: '',
        email: '',
        address: '',
        city: 'Hyderabad',
        weightcategory: '',
        experience: '',
        dominantarm: '',
        previouscompetitions: '',
        whyarmwrestling: '',  // Fixed: was 'whyamwrestling'
        interestedinteam: 'yes',
        availability: '',
        tournamentid: tournamentId || ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ 
        type: 'error', 
        text: `❌ Registration failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">
        {selectedTournament ? `📝 Register for ${selectedTournament.name}` : '📝 Join Hyderabadi Boyz'}
      </h2>
      
      {selectedTournament && (
        <div style={{
          padding: '1rem',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,215,0,0.2)'
        }}>
          <p style={{ color: '#FFD700', marginBottom: '0.3rem' }}>
            🏆 <strong>{selectedTournament.name}</strong>
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            📅 {new Date(selectedTournament.date).toLocaleDateString()} | ⏰ {selectedTournament.time} | 📍 {selectedTournament.location}
          </p>
        </div>
      )}
      
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? '#2ecc71' : '#e74c3c',
          color: 'white'
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!tournamentId && (
          <div className="form-group">
            <label>Select Tournament *</label>
            <select
              name="tournamentid"
              value={formData.tournamentid}
              onChange={handleChange}
              required
            >
              <option value="">Select a tournament</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} - {new Date(t.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Father's Name</label>
          <input
            type="text"
            name="fathername"
            value={formData.fathername}
            onChange={handleChange}
            placeholder="Enter your father's name"
          />
        </div>

        <div className="form-group">
          <label>CNIC Number *</label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
            placeholder="XXXXX-XXXXXXX-X"
          />
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            name="dateofbirth"
            value={formData.dateofbirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="03XX-XXXXXXX"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Your full address"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Weight Category *</label>
          <select
            name="weightcategory"
            value={formData.weightcategory}
            onChange={handleChange}
            required
          >
            <option value="">Select weight category</option>
            {weightCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Experience Level *</label>
          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
          >
            <option value="">Select experience level</option>
            {experienceLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Dominant Arm *</label>
          <select
            name="dominantarm"
            value={formData.dominantarm}
            onChange={handleChange}
            required
          >
            <option value="">Select dominant arm</option>
            {dominantArms.map(arm => (
              <option key={arm} value={arm}>{arm}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Previous Competitions</label>
          <textarea
            name="previouscompetitions"
            value={formData.previouscompetitions}
            onChange={handleChange}
            placeholder="List any previous competitions you've participated in"
          />
        </div>

        <div className="form-group">
          <label>Why do you want to join Hyderabadi Boyz? *</label>
          <textarea
            name="whyarmwrestling"  // Fixed: was 'whyamwrestling'
            value={formData.whyarmwrestling}
            onChange={handleChange}
            required
            placeholder="Tell us why you're interested in joining our team"
          />
        </div>

        <div className="form-group">
          <label>Are you interested in being part of the team? *</label>
          <select
            name="interestedinteam"
            value={formData.interestedinteam}
            onChange={handleChange}
            required
          >
            <option value="yes">Yes, I'm interested</option>
            <option value="no">No, just exploring</option>
          </select>
        </div>

        <div className="form-group">
          <label>Availability for Training *</label>
          <input
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
            placeholder="When are you available for training? (e.g., Evenings, Weekends)"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? '⏳ Submitting...' : '📝 Register Now'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;