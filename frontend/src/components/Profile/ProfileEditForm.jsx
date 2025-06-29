import React, { useState } from 'react';

const ProfileEditForm = ({ profileData, onUpdate }) => {
  const [form, setForm] = useState(profileData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
    // TODO: Send update to backend
  };

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit}>
      <h3>Edit Info</h3>
      <div className="form-group">
        <label>First Name</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Last Name</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" />
      </div>
      <div className="form-group">
        <label>Date of Birth</label>
        <input name="dob" value={form.dob} onChange={handleChange} type="date" />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} />
      </div>
      <button className="save-btn" type="submit">Save Changes</button>
    </form>
  );
};

export default ProfileEditForm; 