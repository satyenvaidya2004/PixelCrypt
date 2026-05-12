import React from 'react';
import '../styles/Footer.css';
import logo from '../images/logo.webp';
import lockImg from '../images/stego_shield_3d_lock.png'; // Make sure to move the generated image here
import {
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiUploadCloud,
  FiDownloadCloud,
  FiClock,
  FiShield,
  FiLock,
  FiArrowUp
} from "react-icons/fi";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-outer">
      <div className="footer-border-gradient">
        <div className="footer-main-container">
          <div className="footer-grid">
            {/* BRAND SECTION */}
            <div className="footer-brand-section">
              <div className="footer-brand-header">
                <img src={logo} alt="PixelCrypt Logo" className="footer-custom-logo" />
                <div className="footer-brand-text">
                  <h2 className="footer-title">PixelCrypt</h2>
                  <p className="footer-subtitle">Secure your secrets in images</p>
                </div>
              </div>
              <p className="footer-description">
                PixelCrypt uses advanced steganography to hide your secret messages inside images and decode them with ease. Your privacy is our priority.
              </p>
              <div className="footer-social-icons">
                <a href="#" className="social-icon-wrapper"><FiTwitter /></a>
                <a href="#" className="social-icon-wrapper"><FiGithub /></a>
                <a href="#" className="social-icon-wrapper"><FiLinkedin /></a>
                <a href="#" className="social-icon-wrapper"><FiMail /></a>
              </div>
            </div>

            {/* PRODUCT SECTION */}
            <div className="footer-links-column">
              <h4 className="footer-column-title">PRODUCT</h4>
              <ul className="footer-links-list">
                <li><a href="#"><FiUploadCloud className="link-icon" /> Encode Message</a></li>
                <li><a href="#"><FiDownloadCloud className="link-icon" /> Decode Message</a></li>
                <li><a href="#"><FiClock className="link-icon" /> History</a></li>
              </ul>
            </div>

            {/* STAY SECURE SECTION */}
            <div className="footer-secure-section">
              <h4 className="footer-column-title">STAY SECURE</h4>
              <div className="secure-card">
                <div className="secure-card-header">
                  <FiShield className="secure-card-shield" />
                  <p>Your secrets are safe with PixelCrypt.</p>
                </div>
                <p className="secure-card-text">We never store your files or messages.</p>
                <div className="secure-card-illustration">
                  <img src={lockImg} alt="Secure Illustration" className="lock-illustration" />
                </div>
              </div>
            </div>
          </div>

          <div className="footer-divider-container">
            <div className="footer-divider-line left"></div>
            <div className="footer-divider-icon">
              <img src={logo} alt="PixelCrypt" className="footer-divider-logo" />
            </div>
            <div className="footer-divider-line right"></div>
          </div>

          <div className="footer-bottom-bar">
            <div className="footer-copyright-text">
              © 2026 PixelCrypt. All rights reserved.
            </div>
            <div className="footer-security-info">
              <FiLock className="security-icon" />
              <span>End-to-End Encrypted</span>
              <span className="security-dot"></span>
              <span>Your Data, Your Control</span>
            </div>
            <div className="footer-bottom-actions">
              <button className="back-to-top" onClick={scrollToTop}>
                <FiArrowUp />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


