import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../utils/supabaseClient';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  React.useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (isAdmin === 'true') {
      navigate('/admin-panel');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin-panel');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '400px' }}>
      <h2 className="form-title">🔐 Admin Login</h2>
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          border: '1px solid #e74c3c',
          color: '#e74c3c',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>👤 Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>🔑 Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? '⏳ Logging in...' : '🔐 Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;