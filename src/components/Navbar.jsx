import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  RiHomeLine, 
  RiFileListLine, 
  RiUserAddLine, 
  RiAdminLine,
  RiShieldStarLine
} from '@remixicon/react';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <RiShieldStarLine size={28} className="brand-icon" />
          Hyderabadi <span>Boyz</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <RiHomeLine size={18} />
              Home
            </Link>
          </li>
          <li>
            <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
              <RiUserAddLine size={18} />
              Register
            </Link>
          </li>
          <li>
            <Link to="/matches" className={location.pathname === '/matches' ? 'active' : ''}>
              <RiFileListLine size={18} />
              Matches
            </Link>
          </li>
          <li>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              <RiAdminLine size={18} />
              Admin
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;