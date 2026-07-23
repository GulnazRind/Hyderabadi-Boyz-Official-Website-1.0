import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../utils/supabaseClient';
import { RiAdminLine, RiLockLine, RiUserLine } from '@remixicon/react';

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
      <h2 className="form-title">
        <RiAdminLine size={32} />
        Admin Login
      </h2>
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
          <label>
            <RiUserLine size={16} style={{ verticalAlign: 'middle' }} />
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>
        <div className="form-group">
          <label>
            <RiLockLine size={16} style={{ verticalAlign: 'middle' }} />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          <RiAdminLine size={18} />
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;