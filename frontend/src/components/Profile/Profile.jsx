import React, { useState, useEffect } from 'react';
import { 
  getProfile, 
  updateProfile, 
  setupProfile, 
  updateProfilePicture, 
  removeProfilePicture 
} from '../../services/api';
import Sidebar from '../Dashboard/Sidebar';
import Topbar from '../Dashboard/Topbar';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      
      // Initialize form data with current profile
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        dateOfBirth: profileData.dateOfBirth || '',
        streetAddress: profileData.streetAddress || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipcode: profileData.zipcode || '',
        phone: profileData.phone || '',
        bio: profileData.bio || ''
      });
      
      setProfilePicUrl(profileData.profile_pic || '');
      
      // Check if profile needs setup
      if (!profileData.is_profile_complete) {
        setIsSettingUp(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePicChange = (e) => {
    setProfilePicUrl(e.target.value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update profile data
      if (isSettingUp) {
        await setupProfile(formData);
      } else {
        await updateProfile(formData);
      }
      
      // Update profile picture if changed
      if (profilePicUrl !== profile.profile_pic) {
        if (profilePicUrl.trim()) {
          await updateProfilePicture(profilePicUrl);
        } else if (profile.profile_pic) {
          await removeProfilePicture();
        }
      }
      
      // Reload profile to get updated data
      await loadProfile();
      setIsEditing(false);
      setIsSettingUp(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      dateOfBirth: profile.dateOfBirth || '',
      streetAddress: profile.streetAddress || '',
      city: profile.city || '',
      state: profile.state || '',
      zipcode: profile.zipcode || '',
      phone: profile.phone || '',
      bio: profile.bio || ''
    });
    setProfilePicUrl(profile.profile_pic || '');
    setIsEditing(false);
    setIsSettingUp(false);
    setError(null);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderProfileContent = () => {
    if (loading) {
      return (
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="profile-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadProfile} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture">
            {profile.profile_pic ? (
              <img src={profile.profile_pic} alt="Profile" />
            ) : (
              <div className="profile-picture-placeholder">
                {getInitials(profile.firstName, profile.lastName)}
              </div>
            )}
          </div>
          
          {(isEditing || isSettingUp) && (
            <div className="profile-picture-edit">
              <input
                type="url"
                placeholder="Enter profile picture URL"
                value={profilePicUrl}
                onChange={handleProfilePicChange}
                className="form-input"
              />
              <small>Enter a valid image URL (e.g., https://example.com/image.jpg)</small>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing && !isSettingUp}
                className="form-input"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Address</h3>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                disabled={!isEditing && !isSettingUp}
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isSettingUp}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>About</h3>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing && !isSettingUp}
                className="form-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          {(isEditing || isSettingUp) && (
            <div className="form-actions">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : (isSettingUp ? 'Complete Profile' : 'Save Changes')}
              </button>
              <button 
                onClick={handleCancel} 
                disabled={saving}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Info Display (when not editing) */}
        {!isEditing && !isSettingUp && (
          <div className="profile-info">
            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{profile.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Profile Complete:</span>
                <span className="info-value">
                  {profile.is_profile_complete ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <div className="profile-container">
            <div className="profile-header">
              <h1>{isSettingUp ? 'Complete Your Profile' : 'Profile'}</h1>
              {!isSettingUp && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
            {renderProfileContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile; 