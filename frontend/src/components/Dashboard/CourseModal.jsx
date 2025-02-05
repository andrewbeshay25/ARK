// frontend/src/components/Dashboard/CourseModal.jsx
import React, { useState } from "react";
import "./DashStyles/CourseModal.css";
import { createCourse, joinCourse } from "../../services/api";

const CourseModal = ({ onClose, onCourseAdded, userRole }) => {
  // Assume admin roles are "ADMIN" or "SUPER_ADMIN"
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  
  // For admins, default to "create" mode; for others, only "join" mode is allowed.
  const [mode, setMode] = useState(isAdmin ? "create" : "join");
  const [error, setError] = useState("");

  // State for course creation
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  // State for joining a course
  const [courseCode, setCourseCode] = useState("");

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) {
      setError("Course name is required.");
      return;
    }
    try {
      // Call the API to create a course (which returns the new course object)
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
      // Call the API to join a course using a course code
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
        <h2>{isAdmin ? "Create or Join Course" : "Join Course"}</h2>
        {isAdmin && (
          <div className="mode-toggle">
            <button
              className={mode === "create" ? "active" : ""}
              onClick={() => { setMode("create"); setError(""); }}
            >
              Create
            </button>
            <button
              className={mode === "join" ? "active" : ""}
              onClick={() => { setMode("join"); setError(""); }}
            >
              Join
            </button>
          </div>
        )}
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
