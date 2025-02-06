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
  const response = await axios.get(`${API_BASE_URL}/courses`, {
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
