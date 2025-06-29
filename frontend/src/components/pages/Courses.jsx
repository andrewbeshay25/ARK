import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaPlus, FaSearch, FaUsers, FaBook, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import { getCourses } from '../../services/api';
import Sidebar from '../Dashboard/Sidebar';
import Topbar from '../Dashboard/Topbar';
import './Courses.css';

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.course_description && course.course_description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'enrolled') return matchesSearch && course.is_enrolled;
    if (filterType === 'instructing') return matchesSearch && course.instructor?.user_id === user?.user_id;
    return matchesSearch;
  });

  const canCreateCourse = () => {
    if (!user) return false;
    const userRole = user.user_role?.toLowerCase();
    return userRole === 'admin' || userRole === 'superadmin' || userRole === 'instructor';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main">
          <Topbar />
          <main className="dashboard-content">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main">
          <Topbar />
          <main className="dashboard-content">
            <div className="error-message">
              <h3>⚠️ Error Loading Courses</h3>
              <p>{error}</p>
              <button onClick={fetchCourses} className="retry-btn">
                🔄 Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <div className="courses-page">
            <div className="courses-header">
              <h1>📚 My Courses</h1>
              <p className="courses-subtitle">
                Manage your courses, assignments, and learning progress
              </p>
            </div>

            <div className="courses-actions">
              <div className="search-filter-section">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Courses</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="instructing">Instructing</option>
                </select>
              </div>
              
              {canCreateCourse() && (
                <Link to="/create-course" className="create-course-btn">
                  <FaPlus /> Create Course
                </Link>
              )}
            </div>

            {filteredCourses.length === 0 ? (
              <div className="no-courses">
                <div className="no-courses-icon">📚</div>
                <h3>No courses found</h3>
                <p>
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first course or joining an existing one.'
                  }
                </p>
                {canCreateCourse() && !searchTerm && filterType === 'all' && (
                  <Link to="/create-course" className="create-first-course-btn">
                    <FaPlus /> Create Your First Course
                  </Link>
                )}
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <div key={course.course_id} className="course-card">
                    <div className="course-card-header" onClick={() => toggleExpanded(course.course_id)}>
                      <div className="course-info">
                        <div className="course-title-section">
                          <h3>{course.course_name}</h3>
                        </div>
                        {course.course_description && (
                          <p className="course-description">{course.course_description}</p>
                        )}
                      </div>
                      
                      <div className="course-meta">
                        <div className="course-instructor">
                          <div className="instructor-avatar">
                            {course.instructor?.firstName?.charAt(0) || 'I'}
                          </div>
                          <span>
                            {course.instructor 
                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                              : 'No instructor'
                            }
                          </span>
                        </div>
                        
                        <div className="course-stats">
                          <div className="stat">
                            <FaUsers /> {course.students_count || 0}
                          </div>
                          <div className="stat">
                            <FaBook /> {course.assignments_count || 0}
                          </div>
                          <div className="stat">
                            <FaCalendarAlt /> {course.events_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="course-actions">
                      <Link 
                        to={`/courses/${course.course_id}/overview`} 
                        className="view-course-btn"
                      >
                        <FaGraduationCap /> View Course
                      </Link>
                    </div>

                    {expandedCourse === course.course_id && (
                      <div className="course-expanded">
                        {/* Expanded content can be added here */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Courses; 