import React, { useContext, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import shieldImage from "../images/glowing_cyber_shield.png";

import "../styles/Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return setMsg("Email is required.");
    if (!form.password.trim()) return setMsg("Password is required.");

    try {
      await login(form.email, form.password);
    } catch (err) {
      const backendMessage = err?.response?.data?.detail || err?.response?.data?.message || "Login failed. Please try again.";
      setMsg(backendMessage);
    }
  };

  const handleSocialLogin = (provider) => {
    setMsg(`${provider} login not implemented yet.`);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT PANEL */}
        <div className="login-info">
          <div className="login-logo-section">
            <div className="logo-title">
              <img src="/logo.png" alt="PixelCrypt Logo" className="logo-img" />
              <h1>PixelCrypt</h1>
            </div>
            <p>Secure your secrets in images</p>
          </div>

          <div className="login-hero-text">
            <h1 className="hero-hide">Hide.</h1>
            <h1 className="hero-protect">Protect.</h1>
            <h1 className="hero-reveal">Reveal.</h1>
            <p>
              PixelCrypt lets you encode secret messages inside images and decode them securely with ease.
            </p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper cyan">
                <FaShieldAlt />
              </div>
              <div className="feature-text">
                <h3>Strong Security</h3>
                <p>Your data is encrypted and secure</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper purple">
                <FiEye />
              </div>
              <div className="feature-text">
                <h3>Invisible Protection</h3>
                <p>Hide messages inside images without anyone knowing</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper pink">
                <FiZap />
              </div>
              <div className="feature-text">
                <h3>Fast & Efficient</h3>
                <p>Encode and decode in seconds with a simple interface</p>
              </div>
            </div>
          </div>

          {/* Background glowing rings/shield */}
          <div className="background-glow-effects">
            <img src={shieldImage} alt="Cyber Shield" className="hero-shield-img" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-form-wrapper">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back 👋</h2>
              <p>Login to access your secure dashboard</p>
            </div>

            <div className="divider-container">
              <div className="divider-line"></div>
              <div className="divider-icon"><FiShield /></div>
              <div className="divider-line"></div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>

              <div className="input-group">
                <label>Email Address</label>
                <div className="input-field">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => {
                      setMsg(null);
                      setForm({ ...form, email: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-field">
                  <FiLock className="input-icon" />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => {
                      setMsg(null);
                      setForm({ ...form, password: e.target.value });
                    }}
                    required
                  />
                  <div className="eye-icon" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <FiEye /> : <FiEyeOff />}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <span className="forgot-link" onClick={() => navigate("/forgot")}>
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-btn">
                Login <span className="arrow-icon">→</span>
              </button>

              {msg && <div className="login-msg">{msg}</div>}
            </form>



            <div className="signup-prompt">
              Don't have an account? <span className="signup-link" onClick={() => navigate("/register")}>Sign up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
