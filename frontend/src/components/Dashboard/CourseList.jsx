// frontend/src/components/Dashboard/CourseList.jsx
import React, { useState, useEffect, useContext } from "react";
import "./DashStyles/CourseList.css";
import { getCourses } from "../../services/api";
import CourseModal from "./CourseModal";
import { FaPlus } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // "create" or "join"
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode) => setModalMode(mode);
  const closeModal = () => setModalMode(null);
  const handleCourseAdded = (newCourse) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  // Case-sensitive check; make sure user_role in localStorage is uppercase.
  const isAdmin = user && (user.user_role === "ADMIN" || user.user_role === "SUPER_ADMIN");

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="course-list">
      <div className="course-list-header">
        <h3 className="my-title">Your Courses</h3>
        <div className="course-buttons">
          {isAdmin && (
            <button className="action-btn" onClick={() => openModal("create")}>
              Create Course
            </button>
          )}
          <button className="action-btn" onClick={() => openModal("join")}>
            Join Course
          </button>
        </div>
      </div>
      {courses.length > 0 ? (
        <div className="course-grid">
          {courses.map((course) => (
            <a key={course.course_id} href={`/courses/${course.course_id}`}>
              <div className="course-card">
                <h4>{course.course_name}</h4>
                {course.course_description && <p>{course.course_description}</p>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="no-courses">
          <p>No courses available</p>
        </div>
      )}
      {modalMode && (
        <CourseModal
          mode={modalMode}
          onClose={closeModal}
          onCourseAdded={handleCourseAdded}
        />
      )}
    </div>
  );
};

export default CourseList;