import React from 'react';

const ProfilePicUpload = ({ profilePic, onUpdate }) => {
  // TODO: Implement upload logic
  return (
    <div className="profile-pic-upload">
      <img src={profilePic || '/default-profile.png'} alt="Profile" className="profile-pic" />
      <button className="upload-btn">Change Photo</button>
    </div>
  );
};

export default ProfilePicUpload; 