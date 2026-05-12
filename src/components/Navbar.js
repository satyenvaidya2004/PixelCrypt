import React, { useState, useEffect, useContext } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.webp";
import AuthContext from "./AuthContext";
import { AiOutlineUser } from "react-icons/ai";
import { MdLogout, MdHistory, MdAdminPanelSettings, MdLogin } from "react-icons/md";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixedNav, setIsFixedNav] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prevent body scroll when mobile menu is open 
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  // FIXED NAV
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsFixedNav(true);
      return;
    }
    const updateNavState = () => setIsFixedNav(window.scrollY > 20);
    updateNavState();
    window.addEventListener("scroll", updateNavState);
    return () => window.removeEventListener("scroll", updateNavState);
  }, [location.pathname]);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isFixedNav ? "fixed" : ""}`}>
        <div className="navbar-container">

          {/* BRAND */}
          <div className="navbar-brand">
            <Link to="/" onClick={closeMenus}>
              <img src={logo} alt="PixelCrypt Logo" className="navbar-logo" />
            </Link>
            <span className="navbar-brand-name">
              <span className="brand-encdec">Pixel</span>
              <span className="brand-lab">Crypt</span>
            </span>
          </div>

          {/* HAMBURGER MENU */}
          <button
            className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span className="menu-bar" />
            <span className="menu-bar" />
            <span className="menu-bar" />
          </button>

          {isMenuOpen && <div className="menu-overlay" onClick={closeMenus} />}

          {/* NAV MENU - CENTERED */}
          <ul className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
            {user?.role === "admin" ? (
              <li>
                <NavLink to="/user-manage" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                  User Manage
                </NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/encode" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                    Encode
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/decode" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                    Decode
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/history" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                    History
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" onClick={closeMenus} className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
                    About
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* NAV ACTIONS - RIGHT */}
          <div className="navbar-actions">


            {!user ? (
              <Link to="/login" className="navbar-login-btn" onClick={closeMenus}>
                <MdLogin /> Login
              </Link>
            ) : (
              <div className={`user-profile-badge dropdown ${isDropdownOpen ? "open" : ""}`}>
                <div className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div className="user-avatar">
                    <AiOutlineUser />
                  </div>
                  <span className="user-name-label">Welcome, {user.name.split(' ')[0]}</span>
                  <span className="arrow">▾</span>
                </div>

                <ul className="dropdown-menu">
                  <li><NavLink to="/profile" onClick={closeMenus}>Profile</NavLink></li>
                  <li><a onClick={() => { logout(); closeMenus(); }}>Logout</a></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isFixedNav && <div className="navbar-spacer" />}
    </>
  );
};

export default React.memo(Navbar);
