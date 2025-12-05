import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllUsers, updateUserRole, deleteUser } from "../api";

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setEditingUser(null);
      alert("User role updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">
            Hi, {user?.name || "Admin"} — manage users and monitor platform activity.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 1200 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform Analytics</span>
          </div>
          <p className="card-meta">
            View cohort-level statistics, problem performance, and user engagement.
          </p>
          <Link to="/analytics" className="btn btn-outline">
            Open Analytics
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">User Management</span>
            <span className="text-muted">{users.length} users</span>
          </div>
          
          {loading ? (
            <p className="text-muted">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-muted">No users found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {editingUser === u.id ? (
                        <select
                          className="select"
                          defaultValue={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ width: 'auto', minWidth: '120px' }}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${u.role}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {editingUser === u.id ? (
                          <button
                            className="btn btn-sm"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => setEditingUser(u.id)}
                          >
                            Edit Role
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Problem Bank</span>
          </div>
          <p className="card-meta">
            Browse and manage all active problems in the system.
          </p>
          <Link to="/problems" className="btn btn-outline">
            View Problems
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
