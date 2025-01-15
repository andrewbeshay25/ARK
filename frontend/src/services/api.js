import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Replace with your backend URL

// Register a new user
export const register = async (username, password, firstName, lastName) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    password,
    firstName,
    lastName,
  });
  return response.data;
};

// Log in a user
export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });
  return response.data;
};
