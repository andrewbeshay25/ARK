// frontend/src/components/Dashboard/UpcomingEvents.jsx
import React, { useState, useEffect } from "react";
import "./DashStyles/UpcomingSection.css";
import { getEvents } from "../../services/api";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading upcoming events...</div>;
  }

  return (
    <div className="upcoming-events">
      <h3 className="my-title">Upcoming Events</h3>
      {events.length > 0 ? (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.event_id} className="event-card">
              <h4>{event.event_name}</h4>
              <p>{event.event_description}</p>
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
    </div>
  );
};

export default UpcomingEvents;
