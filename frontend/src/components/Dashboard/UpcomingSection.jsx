import React from "react";
import "./DashStyles/UpcomingSection.css";

const upcomingItems = [
  { id: 1, title: "Midterm Exam", date: "2025-02-15", type: "Exam" },
  { id: 2, title: "Project Submission", date: "2025-02-20", type: "Assignment" },
  { id: 3, title: "Quiz 3", date: "2025-02-22", type: "Quiz" },
];

const UpcomingSection = () => {
  return (
    <div className="upcoming-section">
      <h2>Upcoming</h2>
      <div className="upcoming-grid">
        {upcomingItems.map((item) => (
          <div key={item.id} className="upcoming-item">
            <h3>{item.title}</h3>
            <p>{item.type}</p>
            <p>{new Date(item.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingSection;
