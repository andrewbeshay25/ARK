import React from 'react';
import './CourseStyles/CourseOverview.css';

const CourseOverview = ({ courseData }) => {
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

  return (
    <div className="course-overview">
      {/* Course Header */}
      <div className="course-header-section">
        <div className="course-header-content">
          <div className="course-title-section">
            <h1 className="course-title">{courseData.course_name}</h1>
          </div>
          {courseData.course_description && (
            <p className="course-description">{courseData.course_description}</p>
          )}
          {courseData.instructor && (
            <div className="instructor-info">
              <span className="instructor-label">Instructor:</span>
              <span className="instructor-name">
                {courseData.instructor.firstName} {courseData.instructor.lastName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{courseData.students_count}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{courseData.assignments_count}</h3>
            <p>Assignments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-content">
            <h3>{courseData.announcements_count}</h3>
            <p>Announcements</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{courseData.events_count}</h3>
            <p>Events</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Assignments */}
        <div className="content-card assignments-card">
          <div className="card-header">
            <h2>📝 Recent Assignments</h2>
            <span className="card-count">{courseData.recent_assignments.length}</span>
          </div>
          <div className="card-content">
            {courseData.recent_assignments.length > 0 ? (
              <div className="assignments-list">
                {courseData.recent_assignments.map((assignment) => (
                  <div key={assignment.assignment_id} className="assignment-item">
                    <div className="assignment-info">
                      <h4>{assignment.assignment_name}</h4>
                      <p className="assignment-description">
                        {assignment.assignment_description || 'No description provided'}
                      </p>
                      <div className="assignment-meta">
                        <span className="instructor">By {assignment.instructor_name}</span>
                        <span className={`due-date ${getStatusColor(assignment.assignment_dueDate)}`}>
                          {getDaysUntil(assignment.assignment_dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="assignment-date">
                      {formatDate(assignment.assignment_dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No assignments posted yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="content-card announcements-card">
          <div className="card-header">
            <h2>📢 Recent Announcements</h2>
            <span className="card-count">{courseData.recent_announcements.length}</span>
          </div>
          <div className="card-content">
            {courseData.recent_announcements.length > 0 ? (
              <div className="announcements-list">
                {courseData.recent_announcements.map((announcement) => (
                  <div key={announcement.announcement_id} className="announcement-item">
                    <div className="announcement-header">
                      <h4>{announcement.title}</h4>
                      <span className="announcement-date">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <p className="announcement-content">
                      {announcement.content.length > 150 
                        ? `${announcement.content.substring(0, 150)}...` 
                        : announcement.content
                      }
                    </p>
                    <div className="announcement-meta">
                      <span className="author">By {announcement.instructor_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No announcements posted yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="content-card events-card">
          <div className="card-header">
            <h2>📅 Upcoming Events</h2>
            <span className="card-count">{courseData.upcoming_events.length}</span>
          </div>
          <div className="card-content">
            {courseData.upcoming_events.length > 0 ? (
              <div className="events-list">
                {courseData.upcoming_events.map((event) => (
                  <div key={event.event_id} className="event-item">
                    <div className="event-info">
                      <h4>{event.event_name}</h4>
                      <p className="event-description">
                        {event.event_description || 'No description provided'}
                      </p>
                      <div className="event-meta">
                        <span className="organizer">By {event.instructor_name}</span>
                      </div>
                    </div>
                    <div className="event-date">
                      {formatDate(event.event_date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview; 