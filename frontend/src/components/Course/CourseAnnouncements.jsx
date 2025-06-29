import React, { useState, useEffect } from 'react';
import { getCourseAnnouncements } from '../../services/api';
import './CourseStyles/CourseAnnouncements.css';

const CourseAnnouncements = ({ courseId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getCourseAnnouncements(courseId);
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError(error.response?.data?.detail || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [courseId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffHours > 1) return `${diffHours} hours ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffMinutes > 1) return `${diffMinutes} minutes ago`;
    return 'Just now';
  };

  const getFilteredAnnouncements = () => {
    if (!searchTerm) return announcements;
    return announcements.filter(announcement =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  if (loading) {
    return (
      <div className="course-announcements-loading">
        <div className="loading-spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-announcements-error">
        <div className="error-content">
          <h2>⚠️ Error Loading Announcements</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-announcements">
      <div className="announcements-header">
        <div className="header-content">
          <h1>📢 Course Announcements</h1>
          <p>Stay updated with the latest course information and announcements</p>
        </div>
        <div className="search-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="announcements-stats">
        <div className="stat-item">
          <span className="stat-number">{announcements.length}</span>
          <span className="stat-label">Total Announcements</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {announcements.filter(a => {
              const date = new Date(a.created_at);
              const now = new Date();
              const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
              return diffDays <= 7;
            }).length}
          </span>
          <span className="stat-label">This Week</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {announcements.filter(a => {
              const date = new Date(a.created_at);
              const now = new Date();
              const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
              return diffDays <= 1;
            }).length}
          </span>
          <span className="stat-label">Today</span>
        </div>
      </div>

      <div className="announcements-content">
        {filteredAnnouncements.length > 0 ? (
          <div className="announcements-list">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.announcement_id} className="announcement-card">
                <div className="announcement-header">
                  <div className="announcement-title-section">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <span className="announcement-time">{getTimeAgo(announcement.created_at)}</span>
                  </div>
                  <div className="announcement-meta">
                    <span className="author">By {announcement.instructor_name}</span>
                    <span className="date">{formatDate(announcement.created_at)}</span>
                  </div>
                </div>
                
                <div className="announcement-body">
                  <p className="announcement-content">{announcement.content}</p>
                </div>

                <div className="announcement-actions">
                  <button className="action-btn view-btn">
                    👁️ View Full
                  </button>
                  <button className="action-btn share-btn">
                    📤 Share
                  </button>
                  <button className="action-btn bookmark-btn">
                    🔖 Bookmark
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📢</div>
            <h3>No announcements found</h3>
            <p>
              {searchTerm 
                ? `No announcements match "${searchTerm}".`
                : "No announcements have been posted for this course yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAnnouncements; 