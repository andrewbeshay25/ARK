import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  // Check authentication state on page load
  useEffect(() => {
    // Create a URLSearchParams object from the current URL
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");
    const firstNameFromUrl = queryParams.get("firstName");
  
    if (tokenFromUrl && firstNameFromUrl) {
      // Save token and firstName in localStorage
      localStorage.setItem("token", tokenFromUrl);
      localStorage.setItem("firstName", firstNameFromUrl);
      // Update authentication state
      setIsAuthenticated(true);
      setUser({ firstName: firstNameFromUrl });
      // Optionally, remove query parameters from the URL for cleanliness:
      window.history.replaceState({}, document.title, "/home");
    } else {
      // Fallback: check localStorage if the query params aren't present
      const token = localStorage.getItem("token");
      const firstName = localStorage.getItem("firstName");
      if (token && firstName) {
        setIsAuthenticated(true);
        setUser({ firstName });
      }
    }
    setLoading(false); // mark loading as complete
  }, []);
   // Run only once

  const login = (token, firstName) => {
    localStorage.setItem("token", token);
    localStorage.setItem("firstName", firstName);
    setIsAuthenticated(true);
    setUser({ firstName });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
