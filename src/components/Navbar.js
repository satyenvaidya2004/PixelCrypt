import React, { useState, useEffect, useContext } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../images/logo.webp";
import AuthContext from "./AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeLink, setActiveLink] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixedNav, setIsFixedNav] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  // Active nav link for home scrolling
  useEffect(() => {
    if (location.pathname !== "/") setActiveLink(null);
    else setActiveLink((prev) => prev || "home");
  }, [location.pathname]);

  // FIXED NAV — optimized to avoid global re-rendering
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsFixedNav(true);
      return;
    }

    const updateNavState = () => {
      setIsFixedNav(window.scrollY > 20);
    };

    updateNavState();
    window.addEventListener("scroll", updateNavState);

    return () => window.removeEventListener("scroll", updateNavState);
  }, [location.pathname]);

  const handleScrollTo = (id) => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            <Link
              to="/"
              onClick={() => {
                closeMenus();
                setTimeout(() => {
                  document.getElementById("home")?.scrollIntoView({
                    behavior: "smooth"
                  });
                }, 50);
              }}
            >
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

          {/* NAV MENU */}
          <ul className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
                onClick={() => {
                  closeMenus();
                  setTimeout(() => {
                    document.getElementById("home")?.scrollIntoView({
                      behavior: "smooth"
                    });
                  }, 50);
                }}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/encode"
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
                onClick={closeMenus}
              >
                Encode
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/decode"
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
                onClick={closeMenus}
              >
                Decode
              </NavLink>
            </li>

            <li>
              <a
                href="#resources"
                className={`navbar-link ${activeLink === "resources" ? "active" : ""
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo("resources");
                }}
              >
                Resources
              </a>
            </li>

            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
                onClick={closeMenus}
              >
                About
              </NavLink>
            </li>

            {/* AUTH MENU */}
            {!user ? (
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `login navbar-link${isActive ? " active" : ""}`
                  }
                  onClick={closeMenus}
                >
                  Login
                </NavLink>
              </li>
            ) : (
              <li
                className={`navbar-item dropdown ${isDropdownOpen ? "open" : ""
                  }`}
              >
                <div
                  className="navbar-link dropdown-toggle"
                  onClick={() => setIsDropdownOpen((p) => !p)}
                >
                  {user.name} <span className="arrow">▾</span>
                </div>

                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={closeMenus}
                      className={({ isActive }) =>
                        isActive ? "active" : ""
                      }
                    >
                      Profile
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/encode-history"
                      onClick={closeMenus}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Encode History
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/decode-history"
                      onClick={closeMenus}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Decode History
                    </NavLink>
                  </li>


                  <li>
                    <a
                      className="navbar-link"
                      onClick={() => {
                        logout();
                        closeMenus();
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {isFixedNav && <div className="navbar-spacer" />}
    </>
  );
};

// 🔥 Prevent unnecessary re-renders
export default React.memo(Navbar);
