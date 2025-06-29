// frontend/src/components/Dashboard/CourseDashboardSidebar.jsx
import React, { useContext } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaHome, 
  FaBook, 
  FaBullhorn, 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt,
  FaCog
} from 'react-icons/fa';
import './CourseStyles/CourseDashboardSidebar.css';

const CourseDashboardSidebar = ({ courseData }) => {
  const { courseId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/assignments')) return 'assignments';
    if (path.includes('/announcements')) return 'announcements';
    if (path.includes('/grades')) return 'grades';
    if (path.includes('/members')) return 'members';
    if (path.includes('/events')) return 'events';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Check if user has permission to manage this course
  const canManageCourse = () => {
    if (!user || !courseData) return false;
    const userRole = user.user_role?.toLowerCase().replace(/_/g, '');
    return userRole === 'admin' || userRole === 'superadmin' || 
           (userRole === 'instructor' && courseData.instructor?.user_id === user.user_id);
  };

  const tabs = [
    { path: 'overview', label: 'Overview', icon: FaHome },
    { path: 'assignments', label: 'Assignments', icon: FaBook },
    { path: 'announcements', label: 'Announcements', icon: FaBullhorn },
    { path: 'grades', label: 'Grades', icon: FaGraduationCap },
    { path: 'members', label: 'Members', icon: FaUsers },
    { path: 'events', label: 'Events', icon: FaCalendarAlt },
  ];

  // Add Options tab only for authorized users
  if (canManageCourse()) {
    tabs.push({ path: 'options', label: 'Options', icon: FaCog });
  }

  return (
    <aside className="course-dashboard-sidebar">
      {courseData && (
        <div className="course-info">
          <div className="course-header">
            <h2 className="course-name">{courseData.course_name}</h2>
          </div>
          {courseData.instructor && (
            <div className="instructor-info">
              <span className="instructor-label">Instructor:</span>
              <span className="instructor-name">
                {courseData.instructor.firstName} {courseData.instructor.lastName}
              </span>
            </div>
          )}
        </div>
      )}

      <nav className="course-navigation">
        <ul className="nav-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.path} className="nav-item">
                <Link
                  to={`/courses/${courseId}/${tab.path}`}
                  className={`nav-link ${activeTab === tab.path ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* {courseData && (
        <div className="course-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <span className="stat-number">{courseData.students_count}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <div className="stat-content">
              <span className="stat-number">{courseData.assignments_count}</span>
              <span className="stat-label">Assignments</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📢</span>
            <div className="stat-content">
              <span className="stat-number">{courseData.announcements_count}</span>
              <span className="stat-label">Announcements</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <span className="stat-number">{courseData.events_count}</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
        </div>
      )} */}
    </aside>
  );
};

export default CourseDashboardSidebar;
