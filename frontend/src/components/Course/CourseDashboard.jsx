// frontend/src/components/Dashboard/CourseDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseDashboardSidebar from './CourseDashboardSidebar';
import './CourseStyles/CourseDashboard.css';
import { getCourseDashboard } from '../../services/api'; // This should call your backend endpoint

const CourseDashboard = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the course dashboard data from your API
    const fetchData = async () => {
      try {
        const data = await getCourseDashboard(courseId);
        console.log("Fetched course data:", data);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (!courseData) {
    return <div className="no-data">No data found for this course.</div>;
  }

  return (
    <div className="course-dashboard">
      <CourseDashboardSidebar />
      <div className="course-main">
        <header className="course-header">
          <h1>{courseData.course_name}</h1>
          {courseData.course_description && (
            <p className="course-description">{courseData.course_description}</p>
          )}
        </header>
        <section className="course-content">
          <div className="assignments-section">
            <h3>Assignments</h3>
            {courseData.assignments && courseData.assignments.length > 0 ? (
              <ul className="assignments-list">
                {courseData.assignments.map((assignment) => (
                  <li key={assignment.assignment_id}>
                    {assignment.assignment_name} (Due:{" "}
                    {new Date(assignment.assignment_dueDate).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No assignments posted.</p>
            )}
          </div>
          {/* Additional sections (announcements, grades, members) can be added here */}
        </section>
      </div>
    </div>
  );
};

export default CourseDashboard;
