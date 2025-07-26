import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="basic-footer">
      <p>© {new Date().getFullYear()} MySocialApp. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
