// frontend/src/components/Dashboard/AddCourseModal.jsx
import React, { useState } from "react";
import "./DashStyles/AddCourseModal.css";
import { createCourse } from "../../services/api"; // import the real API call

const AddCourseModal = ({ onClose, onCourseAdded }) => {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) {
      setError("Course name is required.");
      return;
    }
    try {
      // Pass both fields to the API
      const newCourse = await createCourse({
        course_name: courseName,
        course_description: courseDescription,
      });
      onCourseAdded(newCourse);
      onClose();
    } catch (err) {
      console.error("Error creating course:", err);
      setError("There was an error creating the course.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Course</h2>
        {error && <p className="modal-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <textarea
            placeholder="Course Description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
          <div className="modal-buttons">
            <button type="submit" className="modal-submit">
              Create
            </button>
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;