// src/components/ForgotPassword.js
import React, { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaShieldAlt, FaKey } from "react-icons/fa";
import shieldImage from "../images/glowing_cyber_shield.png";

import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const { forgot, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Calculate password strength
  useEffect(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s > 4 ? 4 : s);
  }, [password]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // STEP 1: SEND OTP
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setMsg(null);

    if (!isValidEmail(email)) {
      return setMsg("Please enter a valid email address.");
    }

    try {
      setLoading(true);
      await forgot(email);
      setStep(2);
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP (Visual transition to Step 3)
  const handleVerifyOTP = (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      return setMsg("Please enter the full 6-digit OTP.");
    }
    setStep(3);
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setMsg(null);

    if (password !== confirmPassword) {
      return setMsg("Passwords do not match.");
    }
    if (password.length < 6) {
      return setMsg("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      await resetPassword({
        email,
        otp: otp.join(""),
        new_password: password
      });
      setStep(4);
    } catch (err) {
      setMsg(err?.response?.data?.detail || "Reset failed. Check OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const renderStrengthLabel = () => {
    const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
    const classes = ["weak", "weak", "fair", "good", "strong"];
    return (
      <span className={`strength-label ${classes[strength]}`}>
        Password strength: <span>{labels[strength]}</span>
      </span>
    );
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        {/* LEFT PANEL */}
        <div className="forgot-info">
          <div className="forgot-logo-section">
            <div className="logo-title" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <img src="/logo.png" alt="PixelCrypt Logo" className="logo-img" />
              <h1>PixelCrypt</h1>
            </div>
            <p>Secure your secrets in images</p>
          </div>

          <div className="forgot-hero-text">
            <h1 className="hero-forgot">Forgot</h1>
            <h1 className="hero-password">Password?</h1>
            <p>No worries! It happens. Enter your email and we'll help you reset your password securely.</p>
          </div>

          <div className="forgot-features">
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

          <div className="background-glow-effects">
            <img src={shieldImage} alt="Cyber Shield" className="hero-shield-img" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="forgot-form-wrapper">
          <div className="forgot-form-container">

            {step < 4 ? (
              <>
                <div className="forgot-header">
                  <div className="header-icon-wrapper">
                    {step === 1 && <FiMail />}
                    {step === 2 && <FiShield />}
                    {step === 3 && <FaKey />}
                  </div>
                  <div className="header-text">
                    <h2>Reset Your Password</h2>
                    <p>Follow the steps below to create a new password.</p>
                  </div>
                </div>

                <div className="step-indicator">
                  <div className={`step-item ${step === 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
                    <div className="step-number">1</div>
                    <span className="step-label">Verify Email</span>
                  </div>
                  <div className={`step-item ${step === 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
                    <div className="step-number">2</div>
                    <span className="step-label">Enter OTP</span>
                  </div>
                  <div className={`step-item ${step === 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
                    <div className="step-number">3</div>
                    <span className="step-label">Reset Password</span>
                  </div>
                  <div className={`step-item ${step === 4 ? "active" : ""}`}>
                    <div className="step-number">4</div>
                    <span className="step-label">Done</span>
                  </div>
                  <div className="step-line"></div>
                </div>

                {step === 1 && (
                  <form onSubmit={handleSendOTP}>
                    <div className="input-group">
                      <label>Email Address</label>
                      <div className="input-field">
                        <FiMail className="input-icon" />
                        <input
                          type="email"
                          placeholder="Enter your registered email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#718096", margin: "5px 0 0" }}>
                        We'll send a 6-digit OTP to your email address.
                      </p>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? "Sending..." : "Send OTP"} <FiArrowRight />
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="input-group">
                      <label>Enter OTP</label>
                      <div className="otp-container">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={otpRefs[index]}
                            type="text"
                            maxLength="1"
                            className="otp-box"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                          />
                        ))}
                      </div>
                      <div className="resend-text">
                        Didn't receive OTP? <span className={`resend-link ${loading ? "disabled" : ""}`} onClick={!loading ? handleSendOTP : null}>Resend OTP</span>
                      </div>
                    </div>
                    <button type="submit" className="submit-btn">
                      Verify OTP <FiArrowRight />
                    </button>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="input-group">
                      <label>New Password</label>
                      <div className="input-field">
                        <FiLock className="input-icon" />
                        <input
                          type={showPwd ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <div className="eye-icon" onClick={() => setShowPwd(!showPwd)}>
                          {showPwd ? <FiEye /> : <FiEyeOff />}
                        </div>
                      </div>
                      {password && (
                        <div className="strength-section">
                          {renderStrengthLabel()}
                          <div className="strength-bar">
                            <div className={`strength-segment ${strength >= 1 ? "active " + ["", "weak", "fair", "good", "strong"][strength] : ""}`}></div>
                            <div className={`strength-segment ${strength >= 2 ? "active " + ["", "weak", "fair", "good", "strong"][strength] : ""}`}></div>
                            <div className={`strength-segment ${strength >= 3 ? "active " + ["", "weak", "fair", "good", "strong"][strength] : ""}`}></div>
                            <div className={`strength-segment ${strength >= 4 ? "active " + ["", "weak", "fair", "good", "strong"][strength] : ""}`}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Confirm New Password</label>
                      <div className="input-field">
                        <FiLock className="input-icon" />
                        <input
                          type={showConfirmPwd ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <div className="eye-icon" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                          {showConfirmPwd ? <FiEye /> : <FiEyeOff />}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"} <FiArrowRight />
                    </button>
                  </form>
                )}

                {msg && <div className="login-msg" style={{ marginTop: "20px" }}>{msg}</div>}

                <div className="back-to-login" onClick={() => navigate("/login")}>
                  <FiArrowLeft /> Back to Login
                </div>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon-wrapper">
                  <FiCheckCircle />
                </div>
                <h2>Password Reset!</h2>
                <p>Your password has been successfully updated. You can now log in with your new password.</p>
                <button className="submit-btn" onClick={() => navigate("/login")}>
                  Go to Login <FiArrowRight />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
