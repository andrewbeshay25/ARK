import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaCog, FaTrash, FaEdit, FaEye, FaCopy, FaCheck } from 'react-icons/fa';
import './CourseStyles/CourseOptions.css';

const CourseOptions = ({ courseData, onCourseUpdated, onCourseDeleted }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [courseName, setCourseName] = useState(courseData.course_name);
  const [courseDescription, setCourseDescription] = useState(courseData.course_description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has permission to manage this course
  const canManageCourse = () => {
    if (!user) return false;
    const userRole = user.user_role?.toLowerCase().replace(/_/g, '');
    return userRole === 'admin' || userRole === 'superadmin' || 
           (userRole === 'instructor' && courseData.instructor?.user_id === user.user_id);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(courseData.course_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy course code:', err);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to update course
      // const response = await updateCourse(courseData.course_id, {
      //   course_name: courseName,
      //   course_description: courseDescription
      // });
      
      setIsEditing(false);
      if (onCourseUpdated) {
        onCourseUpdated({ ...courseData, course_name: courseName, course_description: courseDescription });
      }
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to delete course
      // await deleteCourse(courseData.course_id);
      
      if (onCourseDeleted) {
        onCourseDeleted(courseData.course_id);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!canManageCourse()) {
    return (
      <div className="course-options">
        <div className="options-header">
          <FaCog className="options-icon" />
          <h2>Course Options</h2>
        </div>
        <div className="access-denied">
          <p>You don't have permission to manage this course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-options">
      <div className="options-header">
        <FaCog className="options-icon" />
        <h2>Course Options</h2>
      </div>

      <div className="options-content">
        {/* Course Code Section */}
        <div className="option-section">
          <h3>Course Code</h3>
          <div className="course-code-display">
            <div className="code-container">
              <span className="course-code">{courseData.course_code}</span>
              <button 
                className="copy-btn"
                onClick={handleCopyCode}
                title="Copy course code"
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
            <p className="code-description">
              Share this code with students to allow them to join the course.
            </p>
          </div>
        </div>

        {/* Course Information Section */}
        <div className="option-section">
          <div className="section-header">
            <h3>Course Information</h3>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Enter course name"
                />
              </div>
              <div className="form-group">
                <label>Course Description</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Enter course description"
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button 
                  className="save-btn"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setCourseName(courseData.course_name);
                    setCourseDescription(courseData.course_description || '');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="course-info-display">
              <div className="info-item">
                <label>Course Name:</label>
                <span>{courseData.course_name}</span>
              </div>
              <div className="info-item">
                <label>Description:</label>
                <span>{courseData.course_description || 'No description provided'}</span>
              </div>
              <div className="info-item">
                <label>Instructor:</label>
                <span>
                  {courseData.instructor 
                    ? `${courseData.instructor.firstName} ${courseData.instructor.lastName}`
                    : 'Not assigned'
                  }
                </span>
              </div>
              <div className="info-item">
                <label>Students:</label>
                <span>{courseData.students_count || 0} enrolled</span>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="option-section danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-actions">
            <div className="danger-item">
              <div className="danger-info">
                <h4>Delete Course</h4>
                <p>Permanently delete this course and all its data. This action cannot be undone.</p>
              </div>
              <button 
                className="delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                <FaTrash /> Delete Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete "{courseData.course_name}"? 
              This action cannot be undone and will permanently remove:
            </p>
            <ul>
              <li>All course assignments and grades</li>
              <li>All announcements and events</li>
              <li>All student enrollments</li>
              <li>All course data</li>
            </ul>
            <div className="modal-actions">
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteCourse}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete Course'}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOptions; 