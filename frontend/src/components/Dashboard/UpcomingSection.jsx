// frontend/src/components/Dashboard/UpcomingSection.jsx
import React, { useState, useEffect, useContext } from "react";
import "./DashStyles/UpcomingSection.css";
import { getEvents } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import EventModal from "./EventModal";
import { FaPlus } from "react-icons/fa";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventAdded = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  // Check if user is admin or super admin
  const isAdmin = user && (user.user_role === "ADMIN" || user.user_role === "SUPER_ADMIN");

  if (loading) {
    return <div>Loading upcoming events...</div>;
  }

  return (
    <div className="upcoming-events">
      <div className="events-header">
        <h3 className="my-title">Upcoming Events</h3>
        {isAdmin && (
          <button 
            className="action-btn" 
            onClick={() => setShowEventModal(true)}
          >
            <FaPlus /> Create Event
          </button>
        )}
      </div>
      
      {events.length > 0 ? (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.event_id} className="event-card">
              <h4>{event.event_name}</h4>
              {event.event_description && <p>{event.event_description}</p>}
              <p className="event-date">
                {new Date(event.event_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <p>No upcoming events!</p>
        </div>
      )}
      
      {showEventModal && (
        <EventModal
          onClose={() => setShowEventModal(false)}
          onEventAdded={handleEventAdded}
        />
      )}
    </div>
  );
};

export default UpcomingEvents;
