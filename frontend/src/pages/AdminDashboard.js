import React, { useState, useEffect } from "react";
import {
  fetchAdminReviews,
  updateReviewStatus,
  deleteReview,
  fetchAdminUsers,
  updateUserRole,
  deleteUser,
  refreshCache,
} from "../api";

function AdminDashboard() {
  const [tab, setTab] = useState("reviews");

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage reviews, users, and AI cache</p>
      </div>

      <div className="admin-tabs">
        {["reviews", "users", "cache"].map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "reviews" && <ReviewsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "cache" && <CacheTab />}
    </div>
  );
}

// -------------------------
// Reviews Tab
// -------------------------
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    setLoading(true);
    fetchAdminReviews(statusFilter)
      .then((d) => setReviews(d.reviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <label className="form-label" style={{ marginBottom: 0 }}>Filter:</label>
        {["", "approved", "pending", "rejected"].map((s) => (
          <button
            key={s || "all"}
            className={`admin-tab ${statusFilter === s ? "active" : ""}`}
            style={{ padding: "4px 14px" }}
            onClick={() => setStatusFilter(s)}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: "40px auto" }} />
      ) : reviews.length === 0 ? (
        <div className="empty-state"><p>No reviews found.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Course</th>
                <th>Rating</th>
                <th>Content</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.reviewer}</td>
                  <td>{r.course}</td>
                  <td>{"★".repeat(r.rating)}</td>
                  <td style={{ maxWidth: 220 }}>{r.content || <em style={{ color: "var(--gray-500)" }}>No text</em>}</td>
                  <td>
                    <span className={`status-badge status-${r.status}`}>{r.status}</span>
                  </td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.status !== "approved" && (
                        <button className="btn btn-sm btn-outline" onClick={() => handleStatus(r.id, "approved")}>
                          Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button className="btn btn-sm btn-outline" style={{ borderColor: "var(--red)", color: "var(--red)" }} onClick={() => handleStatus(r.id, "rejected")}>
                          Reject
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// -------------------------
// Users Tab
// -------------------------
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAdminUsers()
      .then((d) => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRole = async (id, user_type) => {
    try {
      await updateUserRole(id, user_type);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return loading ? (
    <div className="spinner" style={{ margin: "40px auto" }} />
  ) : (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Reviews</th>
            <th>Questions</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className={`status-badge ${u.user_type === "admin" ? "status-approved" : "status-pending"}`}>
                  {u.user_type}
                </span>
              </td>
              <td>{u.reviews}</td>
              <td>{u.questions}</td>
              <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  {u.user_type !== "admin" ? (
                    <button className="btn btn-sm btn-outline" onClick={() => handleRole(u.id, "admin")}>
                      Make Admin
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-outline" onClick={() => handleRole(u.id, "user")}>
                      Remove Admin
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------
// Cache Tab
// -------------------------
function CacheTab() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const data = await refreshCache();
      setMessage(data.message);
    } catch (err) {
      setError(err.message || "Cache refresh failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--green-dark)", marginBottom: 10 }}>
        Hot Questions Cache
      </h3>
      <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: 20, lineHeight: 1.6 }}>
        Manually refresh the top-10 trending questions cache. This runs automatically daily via{" "}
        <code>python manage.py refresh_hot_cache</code>.
      </p>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary" onClick={handleRefresh} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh Cache Now"}
      </button>
    </div>
  );
}

export default AdminDashboard;
