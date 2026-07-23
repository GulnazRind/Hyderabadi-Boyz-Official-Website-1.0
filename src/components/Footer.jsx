import React from 'react';
import { RiShieldStarLine, RiHeartLine } from '@remixicon/react';

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        <RiShieldStarLine size={18} style={{ color: '#FFD700', verticalAlign: 'middle' }} />
        <span className="gold-text"> Hyderabadi Boyz</span> - Armwrestling Team
      </p>
      <p>Building the future of armwrestling in Hyderabad</p>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#555' }}>
        Made with <RiHeartLine size={14} style={{ color: '#e74c3c', verticalAlign: 'middle' }} /> in Hyderabad
      </p>
    </footer>
  );
};

export default Footer;