import React, { useState } from 'react';

const ProfileSecurity = ({ email }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // TODO: Implement password change logic
  return (
    <div className="profile-security">
      <h3>Security</h3>
      <button onClick={() => setShowPasswordForm((v) => !v)} className="change-password-btn">
        Change Password
      </button>
      {showPasswordForm && (
        <form className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" name="currentPassword" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="newPassword" />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" name="confirmPassword" />
          </div>
          <button className="save-btn" type="submit">Update Password</button>
        </form>
      )}
    </div>
  );
};

export default ProfileSecurity; 