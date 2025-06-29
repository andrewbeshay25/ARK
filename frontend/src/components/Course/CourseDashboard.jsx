// frontend/src/components/Dashboard/CourseDashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CourseDashboardSidebar from './CourseDashboardSidebar';
import CourseOverview from './CourseOverview';
import CourseAssignments from './CourseAssignments';
import CourseAnnouncements from './CourseAnnouncements';
import CourseGrades from './CourseGrades';
import CourseMembers from './CourseMembers';
import CourseEvents from './CourseEvents';
import CourseOptions from './CourseOptions';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import './CourseStyles/CourseDashboard.css';
import { getCourseDashboard } from '../../services/api';

const CourseDashboard = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCourseDashboard(courseId);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError(error.response?.data?.detail || "Failed to load course data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleCourseUpdated = (updatedCourse) => {
    setCourseData(updatedCourse);
  };

  const handleCourseDeleted = (courseId) => {
    // Redirect to courses page after deletion
    window.location.href = '/courses';
  };

  if (loading) {
    return (
      <div className="course-dashboard">
        <div className="course-dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading course dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-dashboard">
        <div className="course-dashboard-error">
          <div className="error-content">
            <h2>⚠️ Error Loading Course</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="course-dashboard">
        <div className="course-dashboard-error">
          <div className="error-content">
            <h2>📚 Course Not Found</h2>
            <p>This course doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-dashboard">
      <CourseDashboardSidebar courseData={courseData} />
      <div className="course-main-content">
        <div className="course-header">
          <div className="back-navigation">
            <Link to="/courses" className="back-btn">
              <FaArrowLeft /> Back to Courses
            </Link>
            <Link to="/dashboard" className="home-btn">
              <FaHome /> Dashboard
            </Link>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CourseOverview courseData={courseData} />} />
          <Route path="assignments" element={<CourseAssignments courseId={courseId} />} />
          <Route path="announcements" element={<CourseAnnouncements courseId={courseId} />} />
          <Route path="grades" element={<CourseGrades courseId={courseId} />} />
          <Route path="members" element={<CourseMembers courseId={courseId} />} />
          <Route path="events" element={<CourseEvents courseId={courseId} />} />
          <Route path="options" element={<CourseOptions courseData={courseData} onCourseUpdated={handleCourseUpdated} onCourseDeleted={handleCourseDeleted} />} />
        </Routes>
      </div>
    </div>
  );
};

export default CourseDashboard;
