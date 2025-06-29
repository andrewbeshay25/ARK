// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");
    const firstNameFromUrl = queryParams.get("firstName");
    const userRoleFromUrl = queryParams.get("user_role");

    if (tokenFromUrl && firstNameFromUrl) {
      // Save values in localStorage (include user_role if provided)
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("firstName", firstNameFromUrl);
      if (userRoleFromUrl) {
        localStorage.setItem("user_role", userRoleFromUrl);
      }
      setIsAuthenticated(true);
      setUser({
        firstName: firstNameFromUrl,
        user_role: userRoleFromUrl || localStorage.getItem("user_role"),
      });
      // Clean URL (remove query parameters)
      window.history.replaceState({}, document.title, "/dashboard");
    } else {
      // Fallback: get data from localStorage
      const token = localStorage.getItem("token");
      const firstName = localStorage.getItem("firstName");
      const user_role = localStorage.getItem("user_role");
      if (token && firstName) {
        setIsAuthenticated(true);
        setUser({ firstName, user_role });
      }
    }
    setLoading(false);
  }, []);

  // The login function now accepts token, firstName, and user_role.
  const login = (token, firstName, user_role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("user_role", user_role);
    setIsAuthenticated(true);
    setUser({ firstName, user_role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("user_role");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
