import React, { useState, useEffect } from 'react';
import { getCourseEvents } from '../../services/api';
import './CourseStyles/CourseEvents.css';

const CourseEvents = ({ courseId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, today

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getCourseEvents(courseId);
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error.response?.data?.detail || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
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
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const getStatusColor = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    if (diffDays <= 7) return 'upcoming';
    return 'future';
  };

  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'upcoming':
          return diffDays > 0;
        case 'past':
          return diffDays < 0;
        case 'today':
          return diffDays === 0;
        default:
          return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate > today;
    }).length;
    
    const past = events.filter(event => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    }).length;
    
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;
    
    return { total: events.length, upcoming, past, today: todayEvents };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="course-events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-events-error">
        <div className="error-content">
          <h2>⚠️ Error Loading Events</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-events">
      <div className="events-header">
        <div className="header-content">
          <h1>📅 Course Events</h1>
          <p>View and manage all events scheduled for this course</p>
        </div>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className="events-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.upcoming}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.today}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.past}</span>
          <span className="stat-label">Past</span>
        </div>
      </div>

      <div className="events-content">
        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event.event_id} className="event-card">
                <div className="event-header">
                  <div className="event-date-section">
                    <div className="event-date">
                      <span className="date-day">
                        {new Date(event.event_date).getDate()}
                      </span>
                      <span className="date-month">
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div className="event-status">
                      <span className={`status-badge ${getStatusColor(event.event_date)}`}>
                        {getDaysUntil(event.event_date)}
                      </span>
                    </div>
                  </div>
                  <div className="event-title-section">
                    <h3 className="event-title">{event.event_name}</h3>
                    <p className="event-organizer">By {event.instructor_name}</p>
                  </div>
                </div>
                
                <div className="event-body">
                  <p className="event-description">
                    {event.event_description || 'No description provided'}
                  </p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(event.event_date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Organizer:</span>
                      <span className="detail-value">{event.instructor_name}</span>
                    </div>
                  </div>
                </div>

                <div className="event-actions">
                  <button className="action-btn view-btn">
                    👁️ View Details
                  </button>
                  <button className="action-btn calendar-btn">
                    📅 Add to Calendar
                  </button>
                  <button className="action-btn share-btn">
                    📤 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No events found</h3>
            <p>
              {filter === 'all' 
                ? "No events have been scheduled for this course yet."
                : `No events match the "${filter}" filter.`
              }
            </p>
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="events-summary">
          <div className="summary-card">
            <h3>Event Timeline</h3>
            <div className="event-timeline">
              {events
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .slice(0, 5)
                .map((event) => (
                  <div key={event.event_id} className="timeline-item">
                    <div className="timeline-date">
                      {formatDate(event.event_date)}
                    </div>
                    <div className="timeline-content">
                      <h4>{event.event_name}</h4>
                      <p>By {event.instructor_name}</p>
                    </div>
                    <div className="timeline-status">
                      <span className={`status-dot ${getStatusColor(event.event_date)}`}></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEvents; 