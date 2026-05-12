/* src/components/History.js */
import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  FaHistory, FaLock, FaUnlock, FaImage, FaCheckCircle,
  FaClock, FaSearch, FaChevronLeft, FaChevronRight,
  FaSignOutAlt, FaUser, FaUserShield,
  FaCalendarAlt
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AuthContext from "./AuthContext";
import "../styles/History.css";

const API_BASE = process.env.REACT_APP_API_BASE || "https://pixelcrypt-backend.onrender.com";

export default function History() {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    encoded: 0,
    decoded: 0,
    successRate: 100
  });

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [encodeRes, decodeRes] = await Promise.all([
        fetch(`${API_BASE}/api/history/encode/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/history/decode/list`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const encodeData = await encodeRes.json();
      const decodeData = await decodeRes.json();

      const combined = [
        ...(encodeData.items || []).map(i => ({ ...i, type: 'encoded' })),
        ...(decodeData.items || []).map(i => ({ ...i, type: 'decoded' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setItems(combined);

      // Calculate Stats
      const encodedCount = combined.filter(i => i.type === 'encoded').length;
      const decodedCount = combined.filter(i => i.type === 'decoded').length;
      const successCount = combined.filter(i => i.status?.toLowerCase() === 'success').length;

      setStats({
        total: combined.length,
        encoded: encodedCount,
        decoded: decodedCount,
        successRate: combined.length > 0 ? Math.round((successCount / combined.length) * 100) : 100
      });

    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || (item.status || "success").toLowerCase() === filterStatus.toLowerCase();

    // Date Filtering
    const itemDate = new Date(item.created_at);
    let matchesDate = true;
    if (startDate && endDate) {
      const endOfEndDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      matchesDate = itemDate >= startDate && itemDate <= endOfEndDate;
    } else if (startDate) {
      const startOfDay = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(startDate).setHours(23, 59, 59, 999));
      matchesDate = itemDate >= startOfDay && itemDate <= endOfDay;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="history-page-root">
      {/* Sidebar */}
      <aside className="history-sidebar">
        <div className="hist-sidebar-section">
          <p className="hist-sidebar-label">Overview</p>
          <Link to="/history" className={`hist-sidebar-item ${location.pathname === '/history' ? 'active' : ''}`}>
            <FaHistory /> <span>History Log</span>
          </Link>
        </div>

        <div className="hist-sidebar-section">
          <p className="hist-sidebar-label">History</p>
          <Link to="/encode-history" className="hist-sidebar-item">
            <FaLock /> <span>Encode</span>
          </Link>
          <Link to="/decode-history" className="hist-sidebar-item">
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
            <div className="history-icon-wrapper">
              <FaHistory />
            </div>
            <div className="history-title-group">
              <h1>History Log</h1>
              <p>View and manage all your cryptographic activities.</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="hist-stats-grid">
          <div className="hist-stat-card blue">
            <div className="hist-stat-icon"><FaImage /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.encoded}</div>
              <div className="hist-stat-label">Images Encoded</div>
            </div>
          </div>

          <div className="hist-stat-card purple">
            <div className="hist-stat-icon"><FaLock /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.decoded}</div>
              <div className="hist-stat-label">Images Decoded</div>
            </div>
          </div>

          <div className="hist-stat-card green">
            <div className="hist-stat-icon"><FaCheckCircle /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.successRate}%</div>
              <div className="hist-stat-label">Success Rate</div>
            </div>
          </div>

          <div className="hist-stat-card pink">
            <div className="hist-stat-icon"><FaClock /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.total}</div>
              <div className="hist-stat-label">Total Operations</div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="hist-controls-bar">
          <div className="hist-filters-group">
            <div className="hist-search-wrapper">
              <FaSearch className="hist-search-icon" />
              <input
                type="text"
                placeholder="Search by ID..."
                className="hist-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hist-date-filters">
              <div className="hist-datepicker-wrapper">
                <FaCalendarAlt className="hist-date-icon" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  placeholderText="Filter by date range..."
                  className="hist-datepicker-input"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
            <select className="hist-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Operations</option>
              <option value="encoded">Encoded</option>
              <option value="decoded">Decoded</option>
            </select>
            <select className="hist-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </section>

        {/* Table */}
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Record ID</th>
                <th>Operation</th>
                <th>Message Preview</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</td></tr>
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No records found matching filters.</td></tr>
              ) : paginatedItems.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td>
                    <div className="hist-file-icon">
                      {item.type === 'encoded' ? <FaImage /> : <FaLock />}
                    </div>
                  </td>
                  <td>
                    <div className="hist-file-details">
                      <span className="hist-file-name">{item.id.substring(0, 12)}...</span>
                    </div>
                  </td>
                  <td>
                    <span className={`hist-badge ${item.type}`}>
                      {item.type === 'encoded' ? 'Encode' : 'Decode'}
                    </span>
                  </td>
                  <td>
                    <span className="hist-message-preview">
                      {item.message || "********"}
                    </span>
                  </td>
                  <td>
                    <div className="hist-date-time">
                      <div className="hist-date">{new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="hist-time">{new Date(item.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`hist-badge ${(item.status || "success").toLowerCase()}`}>
                      {(item.status || "Success").charAt(0).toUpperCase() + (item.status || "success").slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="hist-pagination-bar">
            <span>
              Showing {filteredItems.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} records
            </span>
            <div className="hist-pagination-controls">
              <div
                className={`hist-page-num ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <FaChevronLeft size={10} />
              </div>
              {[...Array(totalPages)].map((_, i) => (
                <div
                  key={i + 1}
                  className={`hist-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </div>
              )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
              <div
                className={`hist-page-num ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <FaChevronRight size={10} />
              </div>
            </div>
            <div className="hist-rows-per-page">
              <span>Rows per page:</span>
              <select
                className="hist-rows-select"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
