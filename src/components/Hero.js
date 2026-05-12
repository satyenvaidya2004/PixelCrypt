import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Hero.css";
import heroShield from "../images/hero_clean_shield.png";
import { 
  MdCloudUpload, 
  MdLockOutline, 
  MdVerifiedUser, 
  MdFlashOn 
} from "react-icons/md";
import { HiOutlineShieldCheck } from "react-icons/hi";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-grid"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Hide Your <span className="highlight-blue">Secrets.</span><br />
            Reveal with <span className="highlight-purple">Trust.</span>
          </h1>
          
          <p className="hero-subtitle">
            PixelCrypt lets you securely hide secret messages in images 
            using advanced steganography. Keep your communication private 
            and undetectable.
          </p>

          <div className="hero-buttons">
            <button className="btn-encode" onClick={() => navigate("/encode")}>
              <MdCloudUpload className="btn-icon" /> Encode Message
            </button>
            <button className="btn-decode" onClick={() => navigate("/decode")}>
              <MdLockOutline className="btn-icon" /> Decode Message
            </button>
          </div>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <HiOutlineShieldCheck />
              </div>
              <span>End-to-End Secure</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon purple">
                <MdVerifiedUser />
              </div>
              <span>Your Data, Your Control</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon pink">
                <MdFlashOn />
              </div>
              <span>Fast & Reliable</span>
            </div>
          </div>
        </div>

        <div className="hero-graphic">
          <div className="graphic-container">
            <img src={heroShield} alt="Security Shield" className="main-shield-img" />
            
            {/* Bottom info card */}
            <div className="info-card">
              <div className="info-card-icon">
                <MdLockOutline />
              </div>
              <div className="info-card-text">
                <p className="info-title">Your secret is safe with us.</p>
                <p className="info-desc">We never store your files or messages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
