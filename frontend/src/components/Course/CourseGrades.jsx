import React, { useState, useEffect } from 'react';
import { getCourseGrades } from '../../services/api';
import './CourseStyles/CourseGrades.css';

const CourseGrades = ({ courseId }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high, low, missing

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const data = await getCourseGrades(courseId);
        setGrades(data);
      } catch (error) {
        console.error("Error fetching grades:", error);
        setError(error.response?.data?.detail || "Failed to load grades");
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [courseId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'good';
    if (grade >= 70) return 'average';
    if (grade >= 60) return 'below-average';
    return 'poor';
  };

  const getGradeLetter = (grade) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const getFilteredGrades = () => {
    switch (filter) {
      case 'high':
        return grades.filter(grade => grade.grade >= 90);
      case 'low':
        return grades.filter(grade => grade.grade < 70);
      case 'missing':
        return grades.filter(grade => !grade.submitted_at);
      default:
        return grades;
    }
  };

  const filteredGrades = getFilteredGrades();

  const getStats = () => {
    if (grades.length === 0) return { average: 0, highest: 0, lowest: 0, total: 0 };
    
    const submittedGrades = grades.filter(grade => grade.submitted_at);
    if (submittedGrades.length === 0) return { average: 0, highest: 0, lowest: 0, total: grades.length };
    
    const gradeValues = submittedGrades.map(grade => grade.grade);
    const average = Math.round(gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length);
    const highest = Math.max(...gradeValues);
    const lowest = Math.min(...gradeValues);
    
    return { average, highest, lowest, total: grades.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="course-grades-loading">
        <div className="loading-spinner"></div>
        <p>Loading grades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-grades-error">
        <div className="error-content">
          <h2>⚠️ Error Loading Grades</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-grades">
      <div className="grades-header">
        <div className="header-content">
          <h1>📊 Course Grades</h1>
          <p>View and manage student grades and performance</p>
        </div>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Grades</option>
            <option value="high">High Grades (A)</option>
            <option value="low">Low Grades (C & below)</option>
            <option value="missing">Missing Submissions</option>
          </select>
        </div>
      </div>

      <div className="grades-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Entries</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.average}%</span>
          <span className="stat-label">Average Grade</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.highest}%</span>
          <span className="stat-label">Highest Grade</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.lowest}%</span>
          <span className="stat-label">Lowest Grade</span>
        </div>
      </div>

      <div className="grades-content">
        {filteredGrades.length > 0 ? (
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Grade</th>
                  <th>Letter</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.grade_id} className="grade-row">
                    <td className="student-cell">
                      <div className="student-info">
                        <span className="student-name">{grade.student_name}</span>
                      </div>
                    </td>
                    <td className="assignment-cell">
                      <span className="assignment-name">{grade.assignment_name}</span>
                    </td>
                    <td className="grade-cell">
                      <span className={`grade-value ${getGradeColor(grade.grade)}`}>
                        {grade.grade}%
                      </span>
                    </td>
                    <td className="letter-cell">
                      <span className={`letter-grade ${getGradeColor(grade.grade)}`}>
                        {getGradeLetter(grade.grade)}
                      </span>
                    </td>
                    <td className="submitted-cell">
                      <span className="submitted-date">
                        {formatDate(grade.submitted_at)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="grade-actions">
                        <button className="action-btn view-btn">
                          👁️ View
                        </button>
                        <button className="action-btn edit-btn">
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No grades found</h3>
            <p>
              {filter === 'all' 
                ? "No grades have been recorded for this course yet."
                : `No grades match the "${filter}" filter.`
              }
            </p>
          </div>
        )}
      </div>

      {grades.length > 0 && (
        <div className="grades-summary">
          <div className="summary-card">
            <h3>Grade Distribution</h3>
            <div className="grade-distribution">
              <div className="distribution-item">
                <span className="grade-range">A (90-100)</span>
                <span className="grade-count">
                  {grades.filter(g => g.grade >= 90).length}
                </span>
              </div>
              <div className="distribution-item">
                <span className="grade-range">B (80-89)</span>
                <span className="grade-count">
                  {grades.filter(g => g.grade >= 80 && g.grade < 90).length}
                </span>
              </div>
              <div className="distribution-item">
                <span className="grade-range">C (70-79)</span>
                <span className="grade-count">
                  {grades.filter(g => g.grade >= 70 && g.grade < 80).length}
                </span>
              </div>
              <div className="distribution-item">
                <span className="grade-range">D (60-69)</span>
                <span className="grade-count">
                  {grades.filter(g => g.grade >= 60 && g.grade < 70).length}
                </span>
              </div>
              <div className="distribution-item">
                <span className="grade-range">F (0-59)</span>
                <span className="grade-count">
                  {grades.filter(g => g.grade < 60).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseGrades; 