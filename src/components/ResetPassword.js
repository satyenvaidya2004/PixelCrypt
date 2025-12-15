// src/components/ResetPassword.js
import React, { useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import "../styles/ResetPassword.css";

const OTP_LENGTH = 6;

export default function ResetPassword() {
  const { resetPassword } = useContext(AuthContext);
  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const submit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH || !newPassword) {
      setError("Please enter OTP and new password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await resetPassword({
        email: state.email,
        otp: otpValue,
        new_password: newPassword,
      });
      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>

      <p className="subtitle">Enter the OTP sent to your email</p>

      <div className="otp-box-wrapper">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="otp-box"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>

      <input
        type="password"
        className="password-input"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button className="reset-btn" onClick={submit} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}