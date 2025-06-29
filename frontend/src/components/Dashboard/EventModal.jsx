import React, { useState, useEffect } from "react";
import "./DashStyles/EventModal.css";
import { createEvent, getAllCourses } from "../../services/api";

const EventModal = ({ onClose, onEventAdded }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Event form fields
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].course_id.toString());
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventName.trim()) {
      setError("Event name is required.");
      return;
    }
    
    if (!eventDate) {
      setError("Event date is required.");
      return;
    }
    
    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const eventData = {
        event_name: eventName,
        event_date: eventDate,
        event_description: eventDescription || null,
      };

      const newEvent = await createEvent(parseInt(selectedCourseId), eventData);
      onEventAdded(newEvent);
      onClose();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.detail || "There was an error creating the event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Event</h2>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="course-select">Course:</label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="event-name">Event Name:</label>
            <input
              id="event-name"
              type="text"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="event-date">Event Date:</label>
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="event-description">Description (optional):</label>
            <textarea
              id="event-description"
              placeholder="Enter event description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows="3"
            />
          </div>
          
          <div className="modal-buttons">
            <button 
              type="submit" 
              className="modal-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button 
              type="button" 
              className="modal-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 