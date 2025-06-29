import React, { useState } from 'react';

const ProfileDangerZone = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  // TODO: Implement account deletion logic
  return (
    <div className="profile-danger-zone">
      <h3>Danger Zone</h3>
      <button className="delete-account-btn" onClick={() => setShowConfirm(true)}>
        Delete Account
      </button>
      {showConfirm && (
        <div className="delete-confirm-modal">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <button className="confirm-delete-btn">Yes, Delete</button>
          <button className="cancel-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ProfileDangerZone; 