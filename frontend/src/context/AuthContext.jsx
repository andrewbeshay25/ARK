import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  // Check authentication state on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const firstName = localStorage.getItem("firstName");

    if (token && firstName) {
      setIsAuthenticated(true);
      setUser({ firstName });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false); // Mark loading as complete
  }, []); // Run only once

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
