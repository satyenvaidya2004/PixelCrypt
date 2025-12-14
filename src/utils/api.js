// src/utils/api.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL,
  // do NOT set a global Content-Type here so multipart/form-data requests
  // can let the browser/axios set the proper Content-Type+boundary.
  // headers: { "Content-Type": "application/json" },  <-- removed
});

// token helpers
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export function removeToken() {
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
}

export function getToken() {
  return localStorage.getItem("token");
}

// initialize axios with token from storage on import
const existing = getToken();
if (existing) {
  api.defaults.headers.common["Authorization"] = `Bearer ${existing}`;
}

export default api;
