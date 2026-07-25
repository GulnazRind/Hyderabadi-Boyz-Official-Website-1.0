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
    formNumber: '', // NEW FIELD - For those without CNIC
    idType: 'cnic', // NEW FIELD - CNIC or Form-B
    dateofbirth: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    weightcategory: '',
    experience: '',
    dominantarm: '',
    previouscompetitions: '',
    whyarmwrestling: '',
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
      // Validation: Either CNIC or Form Number is required
      if (!formData.cnic.trim() && !formData.formNumber.trim()) {
        throw new Error('Please provide either CNIC Number or Form Number');
      }

      // If CNIC is provided, check for duplicates
      if (formData.cnic.trim()) {
        const { data: existingPlayer, error: checkError } = await supabase
          .from('players')
          .select('cnic')
          .eq('cnic', formData.cnic.trim())
          .single();

        if (existingPlayer) {
          setMessage({ type: 'error', text: '❌ A player with this CNIC already exists!' });
          setLoading(false);
          return;
        }
      }

      // If Form Number is provided, check for duplicates
      if (formData.formNumber.trim()) {
        const { data: existingPlayer, error: checkError } = await supabase
          .from('players')
          .select('form_number')
          .eq('form_number', formData.formNumber.trim())
          .single();

        if (existingPlayer) {
          setMessage({ type: 'error', text: '❌ A player with this Form Number already exists!' });
          setLoading(false);
          return;
        }
      }

      const playerData = {
        fullname: formData.fullname.trim(),
        fathername: formData.fathername ? formData.fathername.trim() : '',
        cnic: formData.cnic.trim() || '',
        form_number: formData.formNumber.trim() || '', // NEW FIELD
        id_type: formData.idType, // NEW FIELD - 'cnic' or 'form-b'
        dateofbirth: formData.dateofbirth,
        phone: formData.phone.trim(),
        email: formData.email ? formData.email.trim() : '',
        address: formData.address.trim(),
        city: formData.city || 'Hyderabad',
        weightcategory: formData.weightcategory,
        experience: formData.experience,
        dominantarm: formData.dominantarm,
        previouscompetitions: formData.previouscompetitions ? formData.previouscompetitions.trim() : '',
        whyarmwrestling: formData.whyarmwrestling.trim(),
        interestedinteam: formData.interestedinteam,
        availability: formData.availability.trim(),
        tournamentid: formData.tournamentid || '',
        registration_date: new Date().toISOString(),
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select();

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `✅ Registration successful! Welcome to Hyderabadi Boyz!` 
      });
      
      setFormData({
        fullname: '',
        fathername: '',
        cnic: '',
        formNumber: '',
        idType: 'cnic',
        dateofbirth: '',
        phone: '',
        email: '',
        address: '',
        city: 'Hyderabad',
        weightcategory: '',
        experience: '',
        dominantarm: '',
        previouscompetitions: '',
        whyarmwrestling: '',
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
    <div className="form-container animate-fadeInUp">
      <h2 className="form-title">
        📝 {selectedTournament ? `Register for ${selectedTournament.name}` : 'Join Hyderabadi Boyz'}
      </h2>
      
      {selectedTournament && (
        <div style={{
          padding: '1rem',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,215,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <div>
            <p style={{ color: '#FFD700', marginBottom: '0.3rem', fontWeight: 'bold' }}>
              {selectedTournament.name}
            </p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              📅 {new Date(selectedTournament.date).toLocaleDateString()} | 
              ⏰ {selectedTournament.time} | 
              📍 {selectedTournament.location}
            </p>
          </div>
        </div>
      )}
      
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
          border: `1px solid ${message.type === 'success' ? '#2ecc71' : '#e74c3c'}`,
          color: message.type === 'success' ? '#2ecc71' : '#e74c3c',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? '✅' : '❌'}
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!tournamentId && (
          <div className="form-group">
            <label>🏆 Select Tournament *</label>
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
          <label>👤 Full Name *</label>
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
          <label>👨 Father's Name</label>
          <input
            type="text"
            name="fathername"
            value={formData.fathername}
            onChange={handleChange}
            placeholder="Enter your father's name"
          />
        </div>

        {/* =============================================
            ID TYPE SELECTION - NEW
            ============================================= */}
        <div className="form-group">
          <label>🪪 ID Type *</label>
          <select
            name="idType"
            value={formData.idType}
            onChange={handleChange}
            required
          >
            <option value="cnic">CNIC (Computerized National Identity Card)</option>
            <option value="form-b">Form-B (For those without CNIC)</option>
          </select>
        </div>

        {/* =============================================
            CNIC NUMBER - Optional now
            ============================================= */}
        <div className="form-group">
          <label>
            🪪 CNIC Number 
            {formData.idType === 'cnic' && <span style={{ color: '#e74c3c' }}> *</span>}
            <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              (Required if you have CNIC)
            </span>
          </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required={formData.idType === 'cnic'}
            placeholder="XXXXX-XXXXXXX-X"
            style={{
              borderColor: formData.idType === 'cnic' && !formData.cnic ? '#e74c3c' : undefined
            }}
          />
          {formData.idType === 'cnic' && !formData.cnic && (
            <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              ⚠️ CNIC Number is required for this ID type
            </p>
          )}
        </div>

        {/* =============================================
            FORM NUMBER - NEW FIELD
            ============================================= */}
        <div className="form-group">
          <label>
            📄 Form Number 
            {formData.idType === 'form-b' && <span style={{ color: '#e74c3c' }}> *</span>}
            <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              (For those without CNIC)
            </span>
          </label>
          <input
            type="text"
            name="formNumber"
            value={formData.formNumber}
            onChange={handleChange}
            required={formData.idType === 'form-b'}
            placeholder="Enter your Form-B number"
            style={{
              borderColor: formData.idType === 'form-b' && !formData.formNumber ? '#e74c3c' : undefined
            }}
          />
          {formData.idType === 'form-b' && !formData.formNumber && (
            <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              ⚠️ Form Number is required for this ID type
            </p>
          )}
        </div>

        <div className="form-group">
          <label>📅 Date of Birth *</label>
          <input
            type="date"
            name="dateofbirth"
            value={formData.dateofbirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>📱 Phone Number *</label>
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
          <label>✉️ Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label>🏠 Address *</label>
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
          <label>📍 City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>⚖️ Weight Category *</label>
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
          <label>⭐ Experience Level *</label>
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
          <label>💪 Dominant Arm *</label>
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
          <label>🏆 Previous Competitions</label>
          <textarea
            name="previouscompetitions"
            value={formData.previouscompetitions}
            onChange={handleChange}
            placeholder="List any previous competitions you've participated in"
          />
        </div>

        <div className="form-group">
          <label>❓ Why do you want to join Hyderabadi Boyz? *</label>
          <textarea
            name="whyarmwrestling"
            value={formData.whyarmwrestling}
            onChange={handleChange}
            required
            placeholder="Tell us why you're interested in joining our team"
          />
        </div>

        <div className="form-group">
          <label>🤝 Are you interested in being part of the team? *</label>
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
          <label>⏰ Availability for Training *</label>
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
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? '⏳ Submitting...' : '📝 Register Now →'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;