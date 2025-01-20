import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Wait until authentication state is initialized
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login
    return <Navigate to="/" />;
  }

  // Allow authenticated users to access the route
  return children;
};

export default PrivateRoute;
