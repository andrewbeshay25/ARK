// frontend/src/components/Dashboard/CourseDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CourseDashboardSidebar from './CourseDashboardSidebar';
import './CourseStyles/CourseDashboard.css';
import { getCourseDashboard } from '../../services/api'; // API call to fetch course details

const CourseDashboard = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the course dashboard data from your API
    const fetchData = async () => {
      try {
        const data = await getCourseDashboard(courseId);
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
        </header>
        <section className="course-summary">
          <div className="summary-card">
            <h3>Announcements</h3>
            {courseData.announcements && courseData.announcements.length > 0 ? (
              <ul>
                {courseData.announcements.map((announcement) => (
                  <li key={announcement.id}>{announcement.title}</li>
                ))}
              </ul>
            ) : (
              <p>No announcements</p>
            )}
          </div>
          <div className="summary-card">
            <h3>Assignments</h3>
            {courseData.assignments && courseData.assignments.length > 0 ? (
              <ul>
                {courseData.assignments.map((assignment) => (
                  <li key={assignment.id}>
                    {assignment.assignment_name}{" "}
                    (Due: {new Date(assignment.assignment_dueDate).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No assignments</p>
            )}
          </div>
          <div className="summary-card">
            <h3>Grades</h3>
            {courseData.grades && courseData.grades.length > 0 ? (
              <ul>
                {courseData.grades.map((gradeItem) => (
                  <li key={gradeItem.id}>
                    Assignment {gradeItem.assignment_id}: {gradeItem.grade}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No grades available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CourseDashboard;
