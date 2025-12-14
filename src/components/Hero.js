import React from 'react';
import '../styles/Hero.css';
import logo from '../images/logo.webp';
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-brand">Pixel</span>
            <span className="hero-brand-alt">Crypt</span>
          </h1>
          <p className="hero-subtitle">
            Your Interactive Cryptography & Data Security Lab
          </p>
          <p className="hero-description">
            Experiment, learn, and master encryption, signatures, and steganography with hands-on tools designed for students and educators. Start exploring the labs below!
          </p>
            {/* 🔥 Updated to React Router navigation */}
          <div className="hero-cta">
            <Link to="/encode" className="cta-button">Encode</Link>
            <Link to="/decode" className="cta-button" style={{ marginLeft: "1rem" }}>
              Decode
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={logo} alt="PixelCrypt Logo" className="hero-logo" />
        </div>
      </div>
    </section>
  );
};

export default Hero;