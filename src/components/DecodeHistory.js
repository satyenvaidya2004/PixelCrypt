// src/components/DecodeHistory.js
import React, { useEffect, useState, useContext } from "react";
import {
  FaEye, FaEyeSlash, FaTrash, FaInfoCircle,
  FaHistory, FaLock, FaUnlock,
  FaTachometerAlt, FaUser, FaSignOutAlt, FaUserShield
} from "react-icons/fa";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "./AuthContext";
import "../styles/History.css"; // Reuse dashboard styles
import "../styles/DecodeHistory.css"; // Specific table styles
import DeleteModal from "./DeleteModal";
import OtpModal from "./OtpModal";

const API_BASE = process.env.REACT_APP_API_BASE || "https://pixelcrypt-backend.onrender.com";

export default function DecodeHistory() {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState({});
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [itemToView, setItemToView] = useState(null);

  // ---------------- LOAD DECODE HISTORY ----------------
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/history/decode/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [token]);

  // ---------------- TOGGLE VIEW (WITH OTP) ----------------
  const toggle = async (id, status) => {
    if (status === "failed") {
      alert("This operation failed. No hidden message exists for this record.");
      return;
    }

    if (!open[id]) {
      // Request OTP from backend
      try {
        const res = await fetch(`${API_BASE}/api/history/decode/${id}/request-otp`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to request OTP");

        setItemToView(id);
        setIsOtpModalOpen(true);
      } catch (err) {
        alert(err.message);
      }
    } else {
      setOpen((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleOtpVerify = async (code) => {
    if (!itemToView) return;

    const res = await fetch(`${API_BASE}/api/history/decode/${itemToView}/view?otp=${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Invalid OTP");
    }

    setDetails((prev) => ({ ...prev, [itemToView]: data }));
    setOpen((prev) => ({ ...prev, [itemToView]: true }));
    setIsOtpModalOpen(false);
    setItemToView(null);
  };

  const handleResend = async () => {
    if (!itemToView) return;
    const res = await fetch(`${API_BASE}/api/history/decode/${itemToView}/request-otp`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Failed to resend OTP");
    }
  };

  const remove = (id) => {
    setItemToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    await fetch(`${API_BASE}/api/history/decode/${itemToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems((prev) => prev.filter((i) => i.id !== itemToDelete));
    setIsModalOpen(false);
    setItemToDelete(null);
  };

  const downloadImage = (key, name) => {
    if (!key) return;
    // Always use the backend proxy via S3 Key to avoid CORS and force download
    const imageUrl = `${API_BASE}/api/history/image/${key}?token=${token}&download=1`;
    window.location.href = imageUrl;
  };

  return (
    <div className="history-page-root decode-history-container">
      {/* Sidebar */}
      <aside className="history-sidebar">
        <div className="hist-sidebar-section">
          <p className="hist-sidebar-label">Overview</p>
          <Link to="/history" className="hist-sidebar-item">
            <FaHistory /> <span>History Log</span>
          </Link>
        </div>

        <div className="hist-sidebar-section">
          <p className="hist-sidebar-label">History</p>
          <Link to="/encode-history" className="hist-sidebar-item">
            <FaLock /> <span>Encode</span>
          </Link>
          <Link to="/decode-history" className={`hist-sidebar-item ${location.pathname === '/decode-history' ? 'active' : ''}`}>
            <FaUnlock /> <span>Decode</span>
          </Link>
        </div>

        <div className="hist-sidebar-section">
          <p className="hist-sidebar-label">Account</p>
          {user?.role === "admin" ? (
            <Link to="/user-manage" className="hist-sidebar-item">
              <FaUserShield /> <span>User Management</span>
            </Link>
          ) : (
            <Link to="/user-manage" className="hist-sidebar-item">
              <FaUser /> <span>Profile</span>
            </Link>
          )}
          <div className="hist-sidebar-item" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="history-main">
        <header className="history-header">
          <div className="hist-header-left">
            <div className="history-icon-wrapper" style={{ background: 'rgba(157, 80, 187, 0.1)', borderColor: 'rgba(157, 80, 187, 0.3)', color: 'var(--accent-purple)' }}>
              <FaUnlock />
            </div>
            <div className="history-title-group">
              <h1>Decode History</h1>
              <p>View all images you've decrypted to extract hidden data.</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="no-records">Loading records...</div>
        ) : items.length === 0 ? (
          <div className="no-records">No decode records found.</div>
        ) : (
          <div className="table" style={{ marginTop: '0' }}>
            <div className="thead">
              <span>Encoded Image</span>
              <span>Password</span>
              <span>Decoded Message</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {items.map((i) => {
              const show = open[i.id];
              const d = details[i.id] || {};
              const isFailed = i.status?.toLowerCase() === "failed";

              return (
                <div className={`trow ${isFailed ? 'row-failed' : ''}`} key={i.id}>
                  {/* ENCODED IMAGE */}
                  <div className="img-cell">
                    <img
                      src={i.encoded_url || `${API_BASE}/api/history/image/${i.encoded_image_file_id}?token=${token}`}
                      className={show ? "unblur" : "blur"}
                      alt="encoded"
                    />
                    {show && i.encoded_image_file_id && (
                      <div className="download-overlay" onClick={() => downloadImage(i.encoded_image_file_id, `decoded_${i.id}`)}>
                        <AiOutlineCloudDownload className="download" title="Download Image" />
                      </div>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <span>{show ? d.password : (isFailed ? "N/A" : "********")}</span>

                  {/* MESSAGE */}
                  <span>{show ? d.message : (isFailed ? "N/A" : "********")}</span>

                  {/* STATUS */}
                  <div className="status-cell">
                    <span className={`hist-badge ${isFailed ? 'failed' : 'success'}`}>
                      {i.status || "Success"}
                    </span>
                  </div>

                  {/* CREATED */}
                  <span className="created">
                    {new Date(i.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    <br />
                    {new Date(i.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* ACTIONS */}
                  <div className="actions">
                    {!isFailed && (
                      show ? (
                        <FaEyeSlash className="eye active" onClick={() => toggle(i.id, i.status)} />
                      ) : (
                        <FaEye className="eye" onClick={() => toggle(i.id, i.status)} />
                      )
                    )}
                    <FaTrash className="trash" onClick={() => remove(i.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Record?"
        message="Are you sure you want to remove this record from your history? The data will be hidden from your dashboard."
      />

      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleOtpVerify}
        onResend={handleResend}
        email={user?.email || "your registered email"}
      />
    </div>
  );
}
