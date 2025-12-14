import React from 'react';
import '../styles/Footer.css';
import logo from '../images/logo.webp';
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer id="about" className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <img src={logo} alt="PixelCrypt Logo" className="footer-logo" />
              <h3 className="footer-brand-name">
                <span className="footer-brand-encdec">Pixel</span>
                <span className="footer-brand-lab">Crypt</span>
              </h3>
            </div>
            <p className="footer-tagline">Where Every Bit Tells a Hidden Story.</p>
            <div className="footer-social">
            <a href="/"><FaEnvelope /></a>
            <a href="/"><FaGithub /></a>
            <a href="/"><FaLinkedin /></a>
            <a href="/"><FaInstagram /></a>
          </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href="#cipher-lab">Cipher Lab</a></li>
              <li><a href="#signature-lab">Signature Lab</a></li>
              <li><a href="#steganography-lab">Steganography Lab</a></li>
              <li><a href="#file-encryption-lab">File Encryption Lab</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#status">Status</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#disclaimer">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 PixelCrypt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

