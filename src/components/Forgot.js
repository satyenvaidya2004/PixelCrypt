// src/components/Forgot.js
import React, { useContext, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Forgot.css";

export default function Forgot() {
  const { forgot } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --------------------------------------------------
  // SEND OTP FOR PASSWORD RESET
  // --------------------------------------------------
  const handleForgot = async (e) => {
    e.preventDefault();

    setMsg(null);

    if (!isValidEmail(email)) {
      return setMsg("Enter a valid email address.");
    }

    try {
      setLoading(true);

      // 🔐 Sends OTP (backend does NOT reveal user existence)
      await forgot(email);

      // 👉 Redirect to Reset Password (OTP + new password)
      navigate("/reset-password", {
        state: { email }
      });

    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to send OTP. Please try again.";
    
      setMsg(backendMessage);    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={handleForgot}>
        <h2>Reset Password</h2>

        <div className="forgot-input">
          <span className="forgot-icon">📧</span>
          <input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setMsg(null);
              setEmail(e.target.value);
            }}
          />
        </div>

        <button
          type="submit"
          className="forgot-btn"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {msg && <div className="forgot-msg">{msg}</div>}

        <div className="forgot-actions">
          <button type="button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
