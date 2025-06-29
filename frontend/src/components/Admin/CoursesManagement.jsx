import React, { useState, useEffect } from "react";
import { getAdminCourses, exportAdminData, updateCourse, deleteCourse } from "../../services/api";
import "./AdminStyles/CoursesManagement.css";

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    instructor_id: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Debounced search to fix the keyboard interruption bug
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAdminCourses(filters);
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === "search") {
      setSearchTerm(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      instructor_id: ""
    });
    setSearchTerm("");
  };

  const handleExport = async () => {
    try {
      const data = await exportAdminData("courses", filters);
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, "courses_export.csv");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse({
      ...course,
      newName: course.course_name,
      newDescription: course.course_description || "",
      newCode: course.course_code,
      newInstructorId: course.instructor_id || ""
    });
  };

  const handleSaveCourse = async () => {
    try {
      const updateData = {};
      if (editingCourse.newName !== editingCourse.course_name) {
        updateData.course_name = editingCourse.newName;
      }
      if (editingCourse.newDescription !== editingCourse.course_description) {
        updateData.course_description = editingCourse.newDescription;
      }
      if (editingCourse.newCode !== editingCourse.course_code) {
        updateData.course_code = editingCourse.newCode;
      }
      if (editingCourse.newInstructorId !== editingCourse.instructor_id) {
        updateData.instructor_id = editingCourse.newInstructorId || null;
      }

      if (Object.keys(updateData).length > 0) {
        await updateCourse(editingCourse.course_id, updateData);
        await fetchCourses(); // Refresh the list
      }
      setEditingCourse(null);
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Failed to update course. Please try again.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      await fetchCourses(); // Refresh the list
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === "string" && value.includes(",") 
            ? `"${value}"` 
            : value;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="courses-management">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-management">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCourses} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-management">
      <div className="courses-header">
        <h2>Courses Management</h2>
        <div className="header-actions">
          <button onClick={handleExport} className="export-btn">
            📥 Export CSV
          </button>
          <button onClick={fetchCourses} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by course name or description..."
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Instructor ID:</label>
            <input
              type="number"
              placeholder="Filter by instructor ID..."
              value={filters.instructor_id}
              onChange={(e) => handleFilterChange("instructor_id", e.target.value)}
            />
          </div>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Course Code</th>
              <th>Description</th>
              <th>Instructor</th>
              <th>Students</th>
              <th>Events</th>
              <th>Announcements</th>
              <th>Assignments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_id}</td>
                <td>
                  {editingCourse?.course_id === course.course_id ? (
                    <input
                      type="text"
                      value={editingCourse.newName}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, newName: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    <div className="course-name">
                      {course.course_name}
                    </div>
                  )}
                </td>
                <td>
                  {editingCourse?.course_id === course.course_id ? (
                    <input
                      type="text"
                      value={editingCourse.newCode}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, newCode: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    <span className="course-code">
                      {course.course_code}
                    </span>
                  )}
                </td>
                <td>
                  {editingCourse?.course_id === course.course_id ? (
                    <textarea
                      value={editingCourse.newDescription}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, newDescription: e.target.value }))}
                      className="edit-textarea"
                      rows="2"
                    />
                  ) : (
                    <div className="course-description">
                      {course.course_description || "No description"}
                    </div>
                  )}
                </td>
                <td>
                  {editingCourse?.course_id === course.course_id ? (
                    <input
                      type="number"
                      placeholder="Instructor ID"
                      value={editingCourse.newInstructorId || ""}
                      onChange={(e) => setEditingCourse(prev => ({ ...prev, newInstructorId: e.target.value }))}
                      className="edit-input"
                    />
                  ) : (
                    course.instructor_name ? (
                      <div className="instructor-info">
                        <span className="instructor-name">{course.instructor_name}</span>
                        <span className="instructor-id">(ID: {course.instructor_id})</span>
                      </div>
                    ) : (
                      <span className="no-instructor">No instructor assigned</span>
                    )
                  )}
                </td>
                <td>
                  <span className="count-badge students">
                    {course.students_count}
                  </span>
                </td>
                <td>
                  <span className="count-badge events">
                    {course.events_count}
                  </span>
                </td>
                <td>
                  <span className="count-badge announcements">
                    {course.announcements_count}
                  </span>
                </td>
                <td>
                  <span className="count-badge assignments">
                    {course.assignments_count}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {editingCourse?.course_id === course.course_id ? (
                      <>
                        <button onClick={handleSaveCourse} className="save-btn">
                          💾 Save
                        </button>
                        <button onClick={() => setEditingCourse(null)} className="cancel-btn">
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditCourse(course)} className="edit-btn">
                          ✏️ Edit
                        </button>
                        <button onClick={() => setShowDeleteConfirm(course.course_id)} className="delete-btn">
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="no-data">
            <p>No courses found matching the current filters.</p>
          </div>
        )}
      </div>

      <div className="courses-summary">
        <p>Total courses: {courses.length}</p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this course? This will also delete all related events, announcements, assignments, and grades. This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => handleDeleteCourse(showDeleteConfirm)} className="confirm-delete-btn">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement; 