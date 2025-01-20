import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const register = async (email, password, firstName, lastName) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
    firstName,
    lastName,
  });
  return response.data; // Ensure this includes the JWT token
};

export const login = async (email, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      email,
      password,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
