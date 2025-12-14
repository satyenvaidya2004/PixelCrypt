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

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgot = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) return setMsg("Enter a valid email.");

    try {
      await forgot(email);
      setMsg("If this email exists, a reset link is sent.");
    } catch (err) {
      setMsg(err.message || "Something went wrong");
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

        <button type="submit" className="forgot-btn">
          Send Reset Link
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
