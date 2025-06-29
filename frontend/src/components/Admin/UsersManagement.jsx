import React, { useState, useEffect, useCallback } from "react";
import { getAdminUsers, exportAdminData, updateUser, deleteUser } from "../../services/api";
import "./AdminStyles/UsersManagement.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    auth_provider: "",
    is_active: "",
    search: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Debounced search to fix the keyboard interruption bug
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers(filters);
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "search") {
      setSearchTerm(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      auth_provider: "",
      is_active: "",
      search: ""
    });
    setSearchTerm("");
  };

  const handleExport = async () => {
    try {
      const data = await exportAdminData("users", filters);
      // Create and download CSV
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, "users_export.csv");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      newRole: user.user_role,
      newStatus: user.is_active
    });
  };

  const handleSaveUser = async () => {
    try {
      const updateData = {};
      if (editingUser.newRole !== editingUser.user_role) {
        updateData.user_role = editingUser.newRole;
      }
      if (editingUser.newStatus !== editingUser.is_active) {
        updateData.is_active = editingUser.newStatus;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser(editingUser.user_id, updateData);
        await fetchUsers(); // Refresh the list
      }
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      await fetchUsers(); // Refresh the list
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === "string" && value.includes(",") 
            ? `"${value}"` 
            : value;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="users-management">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-management">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h2>Users Management</h2>
        <div className="header-actions">
          <button onClick={handleExport} className="export-btn">
            📥 Export CSV
          </button>
          <button onClick={fetchUsers} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="superAdmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="test">Test</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Auth Provider:</label>
            <select
              value={filters.auth_provider}
              onChange={(e) => handleFilterChange("auth_provider", e.target.value)}
            >
              <option value="">All Providers</option>
              <option value="local">Local</option>
              <option value="google">Google</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Auth Provider</th>
              <th>Status</th>
              <th>Profile Complete</th>
              <th>Enrolled Courses</th>
              <th>Instructed Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>
                  <div className="user-name">
                    {user.user_firstName} {user.user_lastName}
                  </div>
                </td>
                <td>{user.user_email}</td>
                <td>
                  {editingUser?.user_id === user.user_id ? (
                    <select
                      value={editingUser.newRole}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, newRole: e.target.value }))}
                      className="role-select"
                    >
                      <option value="superAdmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="instructor">Instructor</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="test">Test</option>
                    </select>
                  ) : (
                    <span className={`role-badge role-${user.user_role.toLowerCase()}`}>
                      {user.user_role}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`auth-badge auth-${user.auth_provider.toLowerCase()}`}>
                    {user.auth_provider}
                  </span>
                </td>
                <td>
                  {editingUser?.user_id === user.user_id ? (
                    <select
                      value={editingUser.newStatus.toString()}
                      onChange={(e) => setEditingUser(prev => ({ ...prev, newStatus: e.target.value === "true" }))}
                      className="status-select"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`profile-badge ${user.is_profile_complete ? "complete" : "incomplete"}`}>
                    {user.is_profile_complete ? "Complete" : "Incomplete"}
                  </span>
                </td>
                <td>{user.enrolled_courses_count}</td>
                <td>{user.instructed_courses_count}</td>
                <td>
                  <div className="action-buttons">
                    {editingUser?.user_id === user.user_id ? (
                      <>
                        <button onClick={handleSaveUser} className="save-btn">
                          💾 Save
                        </button>
                        <button onClick={() => setEditingUser(null)} className="cancel-btn">
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditUser(user)} className="edit-btn">
                          ✏️ Edit
                        </button>
                        <button onClick={() => setShowDeleteConfirm(user.user_id)} className="delete-btn">
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-data">
            <p>No users found matching the current filters.</p>
          </div>
        )}
      </div>

      <div className="users-summary">
        <p>Total users: {users.length}</p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => handleDeleteUser(showDeleteConfirm)} className="confirm-delete-btn">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 