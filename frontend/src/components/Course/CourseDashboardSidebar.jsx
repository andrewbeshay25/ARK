// frontend/src/components/Dashboard/CourseDashboardSidebar.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './CourseStyles/CourseDashboardSidebar.css';

const CourseDashboardSidebar = () => {
  const { courseId } = useParams();

  return (
    <aside className="course-dashboard-sidebar">
      <nav>
        <ul>
          <li>
            <Link to={`/courses/${courseId}`}>Overview</Link>
          </li>
          <li>
            <Link to={`/courses/${courseId}/members`}>Members</Link>
          </li>
          <li>
            <Link to={`/courses/${courseId}/assignments`}>Assignments</Link>
          </li>
          <li>
            <Link to={`/courses/${courseId}/announcements`}>Announcements</Link>
          </li>
          <li>
            <Link to={`/courses/${courseId}/grades`}>Grades</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default CourseDashboardSidebar;
