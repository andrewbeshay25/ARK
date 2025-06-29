// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const register = async (email, password, firstName, lastName) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
    firstName,
    lastName,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

export const getCourses = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const getDetailedCourses = async () => {
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/courses/detailed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching detailed courses:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const getAllCourses = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createCourse = async (courseData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/courses/createCourse`,
    courseData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const joinCourse = async (courseCode) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/courses/joinCourse`,
    { course_code: courseCode },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCourseDashboard = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Course Dashboard API functions
export const getCourseAssignments = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCourseAnnouncements = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCourseGrades = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/grades`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCourseMembers = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCourseEvents = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getEvents = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createEvent = async (courseId, eventData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/courses/${courseId}/events`,
    eventData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Admin API functions
export const getAdminUsers = async (filters = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await axios.get(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminCourses = async (filters = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await axios.get(`${API_BASE_URL}/admin/courses?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminEvents = async (filters = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await axios.get(`${API_BASE_URL}/admin/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAdminStats = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const exportAdminData = async (dataType, filters = {}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  params.append('data_type', dataType);
  
  if (Object.keys(filters).length > 0) {
    params.append('filters', JSON.stringify(filters));
  }
  
  const response = await axios.post(`${API_BASE_URL}/admin/export?${params.toString()}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// User management CRUD operations
export const updateUser = async (userId, userData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/admin/users/${userId}`,
    userData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${API_BASE_URL}/admin/users/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Course management CRUD operations
export const updateCourse = async (courseId, courseData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/admin/courses/${courseId}`,
    courseData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${API_BASE_URL}/admin/courses/${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Event management CRUD operations
export const updateEvent = async (eventId, eventData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/admin/events/${eventId}`,
    eventData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_BASE_URL}/admin/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Profile API functions
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const setupProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.put(
      `${API_BASE_URL}/profile/setup-profile`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error setting up profile:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.put(
      `${API_BASE_URL}/profile/update`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const updateProfilePicture = async (profilePicUrl) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.put(
      `${API_BASE_URL}/profile/profile-pic`,
      { profile_pic_url: profilePicUrl },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile picture:", error.response?.status, error.response?.data);
    throw error;
  }
};

export const removeProfilePicture = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/profile/profile-pic`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing profile picture:", error.response?.status, error.response?.data);
    throw error;
  }
};
