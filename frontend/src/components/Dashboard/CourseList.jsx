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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext); // user.user_role assumed to exist

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleCourseAdded = (newCourse) => {
    // Immediately update the list so that the new course appears without reload.
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="course-list">
      <div className="course-list-header">
        <h3>Your Courses</h3>
        <button className="add-course-button" onClick={handleOpenModal}>
          <FaPlus />
        </button>
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
      {isModalOpen && (
        <CourseModal
          onClose={handleCloseModal}
          onCourseAdded={handleCourseAdded}
          userRole={user.user_role} // e.g., "ADMIN", "SUPER_ADMIN", "STUDENT", etc.
        />
      )}
    </div>
  );
};

export default CourseList;