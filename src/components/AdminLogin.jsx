import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../utils/supabaseClient';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin-panel');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '400px' }}>
      <h2 className="form-title">🔐 Admin Login</h2>
      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem',
          backgroundColor: '#e74c3c',
          color: 'white',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;