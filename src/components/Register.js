import React, { useContext, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap, FiCheckCircle, FiX, FiCheck } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import shieldImage from "../images/glowing_cyber_shield.png";

import "../styles/Register.css";

export default function Register() {
  const { register, verifyRegisterOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  // Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpMsg, setOtpMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong"; // Only 5/5 gets Strong
  };

  const getStrengthColor = (score) => {
    if (score === 0) return "transparent";
    if (score <= 2) return "#ff4d4d"; // Red for Weak
    if (score <= 4) return "#ffd700"; // Yellow for Medium
    return "#00ff88"; // Green for Strong
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMsg(null);

    if (!form.name.trim())
      return setMsg("Name is required.");

    if (!isValidEmail(form.email))
      return setMsg("Invalid email address.");

    if (form.password.length < 6)
      return setMsg("Password must be at least 6 characters.");

    if (!/[A-Z]/.test(form.password))
      return setMsg("Password must contain at least one uppercase letter.");

    if (!/[0-9]/.test(form.password))
      return setMsg("Password must contain at least one number.");

    if (!/[^A-Za-z0-9]/.test(form.password))
      return setMsg("Password must contain at least one special character.");

    if (form.password !== form.confirm)
      return setMsg("Password and Confirm Password do not match.");

    try {
      setLoading(true);

      // 🔐 Sends OTP
      await register(form.name, form.email, form.password);

      // 👉 Show OTP Modal instead of navigating
      setShowOtpModal(true);
      setOtpMsg(null);

    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to send OTP. Please try again.";

      setMsg(backendMessage);
    }
    finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue.trim()) return setOtpMsg("Please enter the OTP.");

    try {
      setVerifying(true);
      setOtpMsg(null);
      await verifyRegisterOTP({ email: form.email, otp: otpValue });

      setIsSuccess(true);
      setOtpMsg("Registration successful! Redirecting...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setOtpMsg(err?.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtpMsg("Sending a new OTP...");
      await register(form.name, form.email, form.password);
      setOtpMsg("A new OTP has been sent to your email.");
    } catch (err) {
      setOtpMsg("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* LEFT PANEL */}
        <div className="register-info">
          <div className="register-logo-section">
            <div className="logo-title">
              <img src="/logo.png" alt="PixelCrypt Logo" className="logo-img" />
              <h1>PixelCrypt</h1>
            </div>
            <p>Secure your secrets in images</p>
          </div>

          <div className="register-hero-text">
            <h1 className="hero-hide">Hide.</h1>
            <h1 className="hero-protect">Protect.</h1>
            <h1 className="hero-reveal">Reveal.</h1>
            <p>
              PixelCrypt lets you encode secret messages inside images and decode them securely with ease.
            </p>
          </div>

          <div className="register-features">
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
        <div className="register-form-wrapper">
          <div className="register-form-container">
            <div className="register-header">
              <h2>Create Account 🚀</h2>
              <p>Join PixelCrypt and secure your messages</p>
            </div>

            <div className="divider-container">
              <div className="divider-line"></div>
              <div className="divider-icon"><FiShield /></div>
              <div className="divider-line"></div>
            </div>

            <form className="register-form" onSubmit={handleRegister}>
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => {
                      setMsg(null);
                      setForm({ ...form, name: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => {
                      setMsg(null);
                      const pass = e.target.value;
                      setForm({ ...form, password: pass });
                      setStrength(calculateStrength(pass));
                    }}
                    required
                  />
                  <div className="eye-icon" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <FiEye /> : <FiEyeOff />}
                  </div>
                </div>

                {/* Password Strength Meter */}
                {form.password && (
                  <div className="password-strength-wrapper">
                    <div className="strength-content">
                      <div className="strength-label-container">
                        <span className="strength-label-text">Password strength:</span>
                        <span className="strength-status" style={{ color: getStrengthColor(strength) }}>
                          {getStrengthLabel(strength)}
                        </span>
                      </div>
                      <div className="strength-meter">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`strength-segment ${i < strength ? "active" : ""}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-field">
                  <FiCheckCircle className="input-icon" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={form.confirm}
                    onChange={(e) => {
                      setMsg(null);
                      setForm({ ...form, confirm: e.target.value });
                    }}
                    required
                  />
                  <div className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FiEye /> : <FiEyeOff />}
                  </div>
                </div>
              </div>

              <button type="submit" className="register-btn" disabled={loading} style={{ marginTop: "10px" }}>
                {loading ? "Sending OTP..." : "Sign Up"} <span className="arrow-icon">→</span>
              </button>

              {msg && <div className="register-msg">{msg}</div>}
            </form>

            <div className="signup-prompt">
              Already have an account? <span className="signup-link" onClick={() => navigate("/login")}>Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-card">
            <div className="otp-modal-close" onClick={() => !verifying && setShowOtpModal(false)}>
              <FiX />
            </div>

            <div className="otp-modal-header">
              <div className="otp-icon-wrapper">
                {isSuccess ? <FiCheck className="success-icon" /> : <FiShield className="shield-icon" />}
              </div>
              <h2>Verify Your Email</h2>
              <p>We've sent a verification code to <strong>{form.email}</strong></p>
            </div>

            <form className="otp-modal-form" onSubmit={handleVerifyOtp}>
              <div className="otp-input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                  disabled={verifying || isSuccess}
                  autoFocus
                />
              </div>

              {otpMsg && (
                <div className={`otp-modal-msg ${isSuccess ? "success" : "error"}`}>
                  {otpMsg}
                </div>
              )}

              <button
                type="submit"
                className="otp-verify-btn"
                disabled={verifying || isSuccess || otpValue.length < 4}
              >
                {verifying ? "Verifying..." : isSuccess ? "Success!" : "Verify OTP"}
              </button>
            </form>

            {!isSuccess && (
              <div className="otp-resend">
                Didn't receive the code? <span onClick={handleResendOtp}>Resend OTP</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}