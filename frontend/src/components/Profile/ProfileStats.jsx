import React from 'react';

const ProfileStats = ({ stats, role, createdAt, lastLogin }) => {
  return (
    <div className="profile-stats">
      <h3>Account Stats</h3>
      <ul>
        <li><strong>Role:</strong> {role}</li>
        <li><strong>Joined:</strong> {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</li>
        <li><strong>Last Login:</strong> {lastLogin ? new Date(lastLogin).toLocaleString() : 'N/A'}</li>
        <li><strong>Courses Enrolled:</strong> {stats.coursesEnrolled || 0}</li>
        <li><strong>Assignments Completed:</strong> {stats.assignmentsCompleted || 0}</li>
        {/* Add more stats as needed */}
      </ul>
    </div>
  );
};

export default ProfileStats; 