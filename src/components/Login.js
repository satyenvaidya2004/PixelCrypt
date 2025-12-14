// src/components/Login.js
import React, { useContext, useState } from "react";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();

    // ------------------------------
    // Validation
    // ------------------------------
    if (!form.email.trim()) return setMsg("Email is required.");
    if (!isValidEmail(form.email)) return setMsg("Invalid email.");
    if (!form.password.trim()) return setMsg("Password is required.");

    try {
      await login(form.email, form.password);

      // ⚠️ DO NOT navigate — AuthContext refreshes instantly
      // navigate("/");

    } catch (err) {
      setMsg(err.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        {/* Email */}
        <div className="login-input">
          <span className="login-icon">📧</span>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, email: e.target.value });
            }}
            required
          />
        </div>

        {/* Password */}
        <div className="login-input">
          <span className="login-icon">🔒</span>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => {
              setMsg(null);
              setForm({ ...form, password: e.target.value });
            }}
            required
          />
          <span className="login-eye" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "👁️" : "🙈"}
          </span>
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>

        {msg && <div className="login-msg">{msg}</div>}

        {/* Navigation Actions */}
        <div className="login-actions">
          <button type="button" onClick={() => navigate("/forgot")}>
            Forgot Password?
          </button>
          <button type="button" onClick={() => navigate("/register")}>
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}
