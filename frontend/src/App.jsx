import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Dashboard/Profile";
import Settings from "./components/Dashboard/Settings";
import AuthForm from "./components/AuthForm";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/pages/Home";
import CourseDashboard from "./components/Course/CourseDashboard";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/courses/:courseId/*" element={
          <PrivateRoute>
            <CourseDashboard />
          </PrivateRoute>
        } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
