import React from "react";
import "../styles/Features.css";
import { MdLockOutline, MdFlashOn } from "react-icons/md";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { AiOutlineEyeInvisible } from "react-icons/ai";


const Features = () => {
  return (
    <>
      <section className="features-section">
        <div className="features-header">
          <h2>Why Choose <span className="highlight-cyan">PixelCrypt</span>?</h2>
          <p>Powerful features to keep your secrets truly secret.</p>
          <div className="header-lines">
            <span className="line left"></span>
            <span className="line right"></span>
          </div>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="icon-container blue">
              <HiOutlineShieldCheck />
            </div>
            <h3>Advanced Steganography</h3>
            <p>Hide text messages inside images with advanced encoding techniques.</p>
            <div className="card-highlight blue-glow"></div>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="icon-container purple">
              <MdLockOutline />
            </div>
            <h3>Password Protection</h3>
            <p>Add a strong password to ensure only authorized users can decode the message.</p>
            <div className="card-highlight purple-glow"></div>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="icon-container pink">
              <AiOutlineEyeInvisible />
            </div>
            <h3>Invisible & Secure</h3>
            <p>The hidden message is completely invisible and does not affect image quality.</p>
            <div className="card-highlight pink-glow"></div>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div className="icon-container cyan">
              <MdFlashOn />
            </div>
            <h3>Fast Performance</h3>
            <p>Encode and decode your messages in just a few seconds.</p>
            <div className="card-highlight cyan-glow"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
