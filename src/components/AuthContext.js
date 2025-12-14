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

  // ----------------------------------------------------
  // Apply token to axios (NO API CALL HERE)
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Validate token ONLY ONCE (SAFE)
  // ----------------------------------------------------
  useEffect(() => {
    if (!token || user) return;

    let cancelled = false;

    api.get("/api/auth/me")
      .then(res => {
        if (!cancelled && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      });

    return () => { cancelled = true; };
  }, [token]);   // 🔑 DEPENDS ON token, NOT empty []

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });

    if (res.data?.ok) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    }
  };

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}

    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
