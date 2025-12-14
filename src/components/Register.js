// src/components/Register.js
import React, { useContext, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

export default function Register() {
  const { register } = useContext(AuthContext);
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

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return setMsg("Name is required.");
    if (!isValidEmail(form.email)) return setMsg("Invalid email.");
    if (form.password.length < 6)
      return setMsg("Password must be at least 6 characters.");
    if (form.password !== form.confirm)
      return setMsg("Passwords do not match.");

    try {
      await register(form.name, form.email, form.password);
      setMsg("Registration successful!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMsg(err.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Create Account</h2>

        {/* Name */}
        <div className="register-input">
          <span className="register-icon">👤</span>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, name: e.target.value });
            }}
          />
        </div>

        {/* Email */}
        <div className="register-input">
          <span className="register-icon">📧</span>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, email: e.target.value });
            }}
          />
        </div>

        {/* Password */}
        <div className="register-input">
          <span className="register-icon">🔒</span>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, password: e.target.value });
            }}
          />
          <span
            className="register-eye"
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? "👁️" : "🙈"}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="register-input">
          <span className="register-icon">🔐</span>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, confirm: e.target.value });
            }}
          />
          <span
            className="register-eye"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "👁️" : "🙈"}
          </span>
        </div>

        <button type="submit" className="register-btn">Register</button>

        {msg && <div className="register-msg">{msg}</div>}

        <div className="register-actions">
          <button type="button" onClick={() => navigate("/login")}>
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}
