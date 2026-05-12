import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { 
  FaHistory, FaLock, FaUnlock,
  FaUser, FaSignOutAlt, FaUserShield,
  FaUsers, FaUserCheck, FaUserTimes,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import AuthContext from "./AuthContext";
import "../styles/History.css"; // Reuse dashboard styles
import "../styles/UserManage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function UserManage() {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    disabled: 0,
    admins: 0
  });

  // ================= LOAD USERS =================
  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      const userList = data.items || [];
      setUsers(userList);

      // Calculate Stats
      setStats({
        total: userList.length,
        active: userList.filter(u => u.access).length,
        disabled: userList.filter(u => !u.access).length,
        admins: userList.filter(u => u.role === 'admin').length
      });
    } catch (err) {
      console.error("User load error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ================= SEARCH FILTER =================
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);

      const activeKeywords = ["true", "active", "enabled", "yes"];
      const disabledKeywords = ["false", "inactive", "disabled", "no"];

      const statusMatch =
        (activeKeywords.includes(q) && u.access === true) ||
        (disabledKeywords.includes(q) && u.access === false);

      return nameMatch || emailMatch || statusMatch;
    });
  }, [users, search]);

  // ================= TOGGLE ACCESS =================
  const toggleAccess = async (userId) => {
    if (!userId || updatingId) return;

    const uRecord = users.find((u) => u.id === userId);
    if (!uRecord) return;

    const newAccess = !uRecord.access;
    setUpdatingId(userId);

    // optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, access: newAccess } : u
      )
    );

    try {
      const res = await fetch(
        `${API_BASE}/api/auth/admin/users/${userId}/access`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ access: newAccess }),
        }
      );

      if (!res.ok) throw new Error("Update failed");
      
      // Update stats after successful toggle
      setStats(prev => ({
        ...prev,
        active: newAccess ? prev.active + 1 : prev.active - 1,
        disabled: newAccess ? prev.disabled - 1 : prev.disabled + 1
      }));

    } catch (err) {
      // rollback
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, access: uRecord.access } : u
        )
      );
      alert("Failed to update access");
    } finally {
      setUpdatingId(null);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

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
          <Link to="/history" className="hist-sidebar-item">
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
          <Link to="/user-manage" className={`hist-sidebar-item ${location.pathname === '/user-manage' ? 'active' : ''}`}>
            <FaUserShield /> <span>User Management</span>
          </Link>
          <div className="hist-sidebar-item" onClick={() => { localStorage.removeItem("token"); window.location.href="/login"; }}>
            <FaSignOutAlt /> <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="history-main">
        <header className="history-header">
          <div className="hist-header-left">
            <div className="history-icon-wrapper" style={{background: 'rgba(0, 242, 96, 0.1)', borderColor: 'rgba(0, 242, 96, 0.3)', color: 'var(--accent-green)'}}>
              <FaUserShield />
            </div>
            <div className="history-title-group">
              <h1>User Management</h1>
              <p>Monitor and control user access across the platform.</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="hist-stats-grid">
          <div className="hist-stat-card blue">
            <div className="hist-stat-icon"><FaUsers /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.total}</div>
              <div className="hist-stat-label">Total Users</div>
            </div>
          </div>

          <div className="hist-stat-card green">
            <div className="hist-stat-icon"><FaUserCheck /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.active}</div>
              <div className="hist-stat-label">Active Users</div>
            </div>
          </div>

          <div className="hist-stat-card pink">
            <div className="hist-stat-icon"><FaUserTimes /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.disabled}</div>
              <div className="hist-stat-label">Disabled Users</div>
            </div>
          </div>

          <div className="hist-stat-card purple">
            <div className="hist-stat-icon"><FaUserShield /></div>
            <div className="hist-stat-info">
              <div className="hist-stat-value">{stats.admins}</div>
              <div className="hist-stat-label">Admin Accounts</div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="hist-controls-bar">
          <div className="hist-filters-group">
            <div className="hist-search-wrapper" style={{maxWidth: '100%'}}>
              <FiSearch className="hist-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email or status..."
                className="hist-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Email Address</th>
                <th>Role</th>
                <th style={{textAlign: 'center'}}>Encodes</th>
                <th style={{textAlign: 'center'}}>Decodes</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>Loading users...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No users found.</td></tr>
              ) : paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="hist-file-details">
                      <span className="hist-file-name">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-secondary">{u.email}</span>
                  </td>
                  <td>
                    <span className={`hist-badge ${u.role === 'admin' ? 'purple' : 'blue'}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className="text-primary" style={{fontWeight: 'bold', color: 'var(--accent-blue)'}}>{u.encode_count || 0}</span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className="text-primary" style={{fontWeight: 'bold', color: 'var(--accent-purple)'}}>{u.decode_count || 0}</span>
                  </td>
                  <td>
                    <span className={`hist-badge ${u.access ? 'success' : 'failed'}`}>
                      {u.access ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="hist-date-time">
                      <div className="hist-date">{new Date(u.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
                    </div>
                  </td>
                  <td>
                    <div className="toggle-wrap">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={u.access}
                          disabled={updatingId === u.id || u.id === user?.id} // Prevent disabling yourself
                          onChange={() => toggleAccess(u.id)}
                        />
                        <span className="slider" />
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="hist-pagination-bar">
            <span>
              Showing {filteredUsers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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
