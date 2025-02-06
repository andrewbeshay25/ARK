// frontend/src/components/Dashboard/CourseModal.jsx
import React, { useState } from "react";
import "./DashStyles/CourseModal.css";
import { createCourse, joinCourse } from "../../services/api";

const CourseModal = ({ mode, onClose, onCourseAdded }) => {
  const [error, setError] = useState("");

  // For "create" mode
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  // For "join" mode
  const [courseCode, setCourseCode] = useState("");

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) {
      setError("Course name is required.");
      return;
    }
    try {
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

  const handleSubmitJoin = async (e) => {
    e.preventDefault();
    if (!courseCode.trim()) {
      setError("Course code is required.");
      return;
    }
    try {
      const joinedCourse = await joinCourse(courseCode);
      onCourseAdded(joinedCourse);
      onClose();
    } catch (err) {
      console.error("Error joining course:", err);
      setError("There was an error joining the course.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{mode === "create" ? "Create Course" : "Join Course"}</h2>
        {error && <p className="modal-error">{error}</p>}
        {mode === "create" ? (
          <form onSubmit={handleSubmitCreate}>
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
        ) : (
          <form onSubmit={handleSubmitJoin}>
            <input
              type="text"
              placeholder="Enter Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <div className="modal-buttons">
              <button type="submit" className="modal-submit">
                Join
              </button>
              <button type="button" className="modal-cancel" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CourseModal;
