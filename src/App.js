import "./App.css";
import "./styles/Scrollbar.css";

import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useContext } from "react";
import AuthContext from "./components/AuthContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Pages
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import ForgotPasswordPage from "./components/ForgotPassword";

import Hero from "./components/Hero";
import Features from "./components/Features";

// Core Functionalities
import Encode from "./components/Encode";
import Decode from "./components/Decode";

// Other Pages
import About from "./components/About";

// History Pages
import History from "./components/History";
import EncodeHistory from "./components/EncodeHistory";
import DecodeHistory from "./components/DecodeHistory";
import UserManage from "./components/UserManage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const hideNavRoutes = ["/login", "/register", "/forgot", "/forgot-password", "/reset-password"];
  const shouldHideNav = hideNavRoutes.includes(location.pathname);

  // ================= ADMIN REDIRECT & BODY CLASS =================
  useEffect(() => {
    if (user?.role === "admin") {
      document.body.classList.add("admin-mode");
      const adminRestrictedRoutes = ["/", "/encode", "/decode", "/history", "/encode-history", "/decode-history", "/about"];
      if (adminRestrictedRoutes.includes(location.pathname)) {
        navigate("/user-manage");
      }
    } else {
      document.body.classList.remove("admin-mode");
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="App">
      {/* Navigation */}
      {!shouldHideNav && <Navbar />}

      <main>
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div style={{ position: "relative", overflow: "hidden" }}>
                {/* Matrix / Rain Effect */}

                {/* Page Content */}
                <Hero />
                <Features />
                <Footer />
              </div>
            }
          />

          {/* Core Functionality */}
          <Route path="/encode" element={<Encode />} />
          <Route path="/decode" element={<Decode />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* History Pages */}
          <Route path="/history" element={<History />} />
          <Route path="/encode-history" element={<EncodeHistory />} />
          <Route path="/decode-history" element={<DecodeHistory />} />
          <Route path="/user-manage" element={<UserManage />} />

          {/* About */}
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
