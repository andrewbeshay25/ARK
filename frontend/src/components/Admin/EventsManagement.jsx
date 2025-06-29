import React, { useState, useEffect } from "react";
import { getAdminEvents, exportAdminData, updateEvent, deleteEvent } from "../../services/api";
import "./AdminStyles/EventsManagement.css";

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    course_id: "",
    instructor_id: "",
    date_from: "",
    date_to: "",
    search: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
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
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAdminEvents(filters);
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
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
      course_id: "",
      instructor_id: "",
      date_from: "",
      date_to: "",
      search: ""
    });
    setSearchTerm("");
  };

  const handleExport = async () => {
    try {
      const data = await exportAdminData("events", filters);
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, "events_export.csv");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent({
      ...event,
      newName: event.event_name,
      newDescription: event.event_description || "",
      newDate: event.event_date,
      newInstructorId: event.instructor_id || ""
    });
  };

  const handleSaveEvent = async () => {
    try {
      const updateData = {};
      if (editingEvent.newName !== editingEvent.event_name) {
        updateData.event_name = editingEvent.newName;
      }
      if (editingEvent.newDescription !== editingEvent.event_description) {
        updateData.event_description = editingEvent.newDescription;
      }
      if (editingEvent.newDate !== editingEvent.event_date) {
        updateData.event_date = editingEvent.newDate;
      }
      if (editingEvent.newInstructorId !== editingEvent.instructor_id) {
        updateData.instructor_id = editingEvent.newInstructorId || null;
      }

      if (Object.keys(updateData).length > 0) {
        await updateEvent(editingEvent.event_id, updateData);
        await fetchEvents(); // Refresh the list
      }
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      await fetchEvents(); // Refresh the list
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="events-management">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-management">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-management">
      <div className="events-header">
        <h2>Events Management</h2>
        <div className="header-actions">
          <button onClick={handleExport} className="export-btn">
            📥 Export CSV
          </button>
          <button onClick={fetchEvents} className="refresh-btn">
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
              placeholder="Search by event name or description..."
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Course ID:</label>
            <input
              type="number"
              placeholder="Filter by course ID..."
              value={filters.course_id}
              onChange={(e) => handleFilterChange("course_id", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Instructor ID:</label>
            <input
              type="number"
              placeholder="Filter by instructor ID..."
              value={filters.instructor_id}
              onChange={(e) => handleFilterChange("instructor_id", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Event Name</th>
              <th>Date</th>
              <th>Description</th>
              <th>Course</th>
              <th>Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id}>
                <td>{event.event_id}</td>
                <td>
                  {editingEvent?.event_id === event.event_id ? (
                    <input
                      type="text"
                      value={editingEvent.newName}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, newName: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    <div className="event-name">
                      {event.event_name}
                    </div>
                  )}
                </td>
                <td>
                  {editingEvent?.event_id === event.event_id ? (
                    <input
                      type="date"
                      value={editingEvent.newDate}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, newDate: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    <span className="event-date">
                      {formatDate(event.event_date)}
                    </span>
                  )}
                </td>
                <td>
                  {editingEvent?.event_id === event.event_id ? (
                    <textarea
                      value={editingEvent.newDescription}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, newDescription: e.target.value }))}
                      className="edit-textarea"
                      rows="2"
                    />
                  ) : (
                    <div className="event-description">
                      {event.event_description || "No description"}
                    </div>
                  )}
                </td>
                <td>
                  <div className="course-info">
                    <span className="course-name">{event.course_name}</span>
                    <span className="course-id">(ID: {event.course_id})</span>
                  </div>
                </td>
                <td>
                  {editingEvent?.event_id === event.event_id ? (
                    <input
                      type="number"
                      placeholder="Instructor ID"
                      value={editingEvent.newInstructorId || ""}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, newInstructorId: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    <div className="instructor-info">
                      <span className="instructor-name">{event.instructor_name}</span>
                      <span className="instructor-id">(ID: {event.instructor_id})</span>
                    </div>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingEvent?.event_id === event.event_id ? (
                      <>
                        <button onClick={handleSaveEvent} className="save-btn">
                          💾 Save
                        </button>
                        <button onClick={() => setEditingEvent(null)} className="cancel-btn">
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditEvent(event)} className="edit-btn">
                          ✏️ Edit
                        </button>
                        <button onClick={() => setShowDeleteConfirm(event.event_id)} className="delete-btn">
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

        {events.length === 0 && (
          <div className="no-data">
            <p>No events found matching the current filters.</p>
          </div>
        )}
      </div>

      <div className="events-summary">
        <p>Total events: {events.length}</p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => handleDeleteEvent(showDeleteConfirm)} className="confirm-delete-btn">
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

export default EventsManagement; 