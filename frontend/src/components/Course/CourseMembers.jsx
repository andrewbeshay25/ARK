import React, { useState, useEffect } from 'react';
import { getCourseMembers } from '../../services/api';
import './CourseStyles/CourseMembers.css';

const CourseMembers = ({ courseId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getCourseMembers(courseId);
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError(error.response?.data?.detail || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [courseId]);

  const getFilteredMembers = () => {
    let filtered = members;

    // Apply role filter
    if (filter !== 'all') {
      filtered = filtered.filter(member => {
        if (filter === 'active') return member.is_active;
        if (filter === 'inactive') return !member.is_active;
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredMembers = getFilteredMembers();

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'instructor':
        return '👨‍🏫';
      case 'student':
        return '👨‍🎓';
      case 'admin':
        return '👨‍💼';
      case 'super_admin':
        return '👑';
      case 'parent':
        return '👨‍👩‍👧‍👦';
      default:
        return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'instructor':
        return 'instructor';
      case 'student':
        return 'student';
      case 'admin':
        return 'admin';
      case 'super_admin':
        return 'super-admin';
      case 'parent':
        return 'parent';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="course-members-loading">
        <div className="loading-spinner"></div>
        <p>Loading course members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-members-error">
        <div className="error-content">
          <h2>⚠️ Error Loading Members</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-members">
      <div className="members-header">
        <div className="header-content">
          <h1>👥 Course Members</h1>
          <p>View and manage all members enrolled in this course</p>
        </div>
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="members-stats">
        <div className="stat-item">
          <span className="stat-number">{members.length}</span>
          <span className="stat-label">Total Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {members.filter(m => m.is_active).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {members.filter(m => !m.is_active).length}
          </span>
          <span className="stat-label">Inactive</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {members.filter(m => m.user_role === 'student').length}
          </span>
          <span className="stat-label">Students</span>
        </div>
      </div>

      <div className="members-content">
        {filteredMembers.length > 0 ? (
          <div className="members-grid">
            {filteredMembers.map((member) => (
              <div key={member.user_id} className="member-card">
                <div className="member-header">
                  <div className="member-avatar">
                    <span className="avatar-icon">
                      {getRoleIcon(member.user_role)}
                    </span>
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="member-email">{member.email}</p>
                  </div>
                  <div className="member-status">
                    <span className={`status-badge ${member.is_active ? 'active' : 'inactive'}`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="member-body">
                  <div className="member-details">
                    <div className="detail-item">
                      <span className="detail-label">Role:</span>
                      <span className={`role-badge ${getRoleColor(member.user_role)}`}>
                        {member.user_role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">#{member.user_id}</span>
                    </div>
                  </div>
                </div>

                <div className="member-actions">
                  <button className="action-btn view-btn">
                    👁️ View Profile
                  </button>
                  <button className="action-btn message-btn">
                    💬 Message
                  </button>
                  {!member.is_active && (
                    <button className="action-btn activate-btn">
                      ✅ Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No members found</h3>
            <p>
              {searchTerm || filter !== 'all'
                ? `No members match the current filters.`
                : "No members are enrolled in this course yet."
              }
            </p>
          </div>
        )}
      </div>

      {members.length > 0 && (
        <div className="members-summary">
          <div className="summary-card">
            <h3>Role Distribution</h3>
            <div className="role-distribution">
              {Object.entries(
                members.reduce((acc, member) => {
                  acc[member.user_role] = (acc[member.user_role] || 0) + 1;
                  return acc;
                }, {})
              ).map(([role, count]) => (
                <div key={role} className="distribution-item">
                  <span className="role-name">
                    {getRoleIcon(role)} {role.replace('_', ' ')}
                  </span>
                  <span className="role-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMembers; 