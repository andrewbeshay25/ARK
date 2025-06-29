import React, { useState, useEffect } from 'react';
import { getCourseAssignments } from '../../services/api';
import './CourseStyles/CourseAssignments.css';

const CourseAssignments = ({ courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, overdue, completed

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await getCourseAssignments(courseId);
        setAssignments(data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setError(error.response?.data?.detail || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [courseId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getStatusColor = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    if (diffDays <= 7) return 'warning';
    return 'normal';
  };

  const getFilteredAssignments = () => {
    const today = new Date();
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.assignment_dueDate);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'upcoming':
          return diffDays > 0;
        case 'overdue':
          return diffDays < 0;
        case 'due-soon':
          return diffDays >= 0 && diffDays <= 7;
        default:
          return true;
      }
    });
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <div className="course-assignments-loading">
        <div className="loading-spinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-assignments-error">
        <div className="error-content">
          <h2>⚠️ Error Loading Assignments</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-assignments">
      <div className="assignments-header">
        <div className="header-content">
          <h1>📝 Course Assignments</h1>
          <p>Manage and view all assignments for this course</p>
        </div>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Assignments</option>
            <option value="upcoming">Upcoming</option>
            <option value="due-soon">Due Soon (≤7 days)</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="assignments-stats">
        <div className="stat-item">
          <span className="stat-number">{assignments.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {assignments.filter(a => new Date(a.assignment_dueDate) > new Date()).length}
          </span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-item">
          <span className="stat-number urgent">
            {assignments.filter(a => {
              const dueDate = new Date(a.assignment_dueDate);
              const today = new Date();
              const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 7;
            }).length}
          </span>
          <span className="stat-label">Due Soon</span>
        </div>
        <div className="stat-item">
          <span className="stat-number overdue">
            {assignments.filter(a => new Date(a.assignment_dueDate) < new Date()).length}
          </span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      <div className="assignments-content">
        {filteredAssignments.length > 0 ? (
          <div className="assignments-grid">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.assignment_id} className="assignment-card">
                <div className="assignment-header">
                  <h3 className="assignment-title">{assignment.assignment_name}</h3>
                  <span className={`status-badge ${getStatusColor(assignment.assignment_dueDate)}`}>
                    {getDaysUntil(assignment.assignment_dueDate)}
                  </span>
                </div>
                
                <div className="assignment-body">
                  <p className="assignment-description">
                    {assignment.assignment_description || 'No description provided'}
                  </p>
                  
                  <div className="assignment-details">
                    <div className="detail-item">
                      <span className="detail-label">Assigned:</span>
                      <span className="detail-value">{formatDate(assignment.assignment_assignedDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Due:</span>
                      <span className="detail-value">{formatDate(assignment.assignment_dueDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Instructor:</span>
                      <span className="detail-value">{assignment.instructor_name}</span>
                    </div>
                  </div>
                </div>

                <div className="assignment-actions">
                  <button className="action-btn view-btn">
                    👁️ View Details
                  </button>
                  <button className="action-btn submit-btn">
                    📤 Submit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No assignments found</h3>
            <p>
              {filter === 'all' 
                ? "No assignments have been posted for this course yet."
                : `No assignments match the "${filter}" filter.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAssignments; 