import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ✨ Hyderabadi <span>Boyz</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              🏠 Home
            </Link>
          </li>
          <li>
            <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
              📝 Register
            </Link>
          </li>
          <li>
            <Link to="/matches" className={location.pathname === '/matches' ? 'active' : ''}>
              ⚔️ Matches
            </Link>
          </li>
          <li>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              🔐 Admin
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;