// src/components/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token]);

  useEffect(() => {
    if (!token || user) return;
    api.get("/api/auth/me")
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      });
  }, [token]);

  // ---------------- REGISTER (SEND OTP)
  const register = async (name, email, password) => {
    const res = await api.post("/api/auth/register", { name, email, password });
    if (!res.data.ok) throw new Error(res.data.detail || "OTP failed");
  };

  // ---------------- VERIFY REGISTER OTP
  const verifyRegisterOTP = async (payload) => {
    const res = await api.post("/api/auth/verify-register-otp", payload);
    if (!res.data.ok) throw new Error("OTP verification failed");
  };

  // ---------------- FORGOT PASSWORD (SEND OTP)
  const forgot = async (email) => {
    await api.post("/api/auth/forgot", { email });
  };

  // ---------------- RESET PASSWORD
  const resetPassword = async (payload) => {
    const res = await api.post("/api/auth/reset-password", payload);
    if (!res.data.ok) throw new Error("Reset failed");
  };

  // ---------------- LOGIN
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.data.ok) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    }
  };

  // ---------------- LOGOUT
  const logout = async () => {
    try { await api.post("/api/auth/logout"); } catch {}
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      token, user,
      login, logout,
      register,
      verifyRegisterOTP,
      forgot,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
