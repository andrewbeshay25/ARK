import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminStyles/AdminDashboard.css";
import StatsOverview from "./StatsOverview";
import UsersManagement from "./UsersManagement";
import CoursesManagement from "./CoursesManagement";
import EventsManagement from "./EventsManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is SUPER_ADMIN
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user?.user_role !== "SUPER_ADMIN") {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.user_role !== "SUPER_ADMIN") {
    return null;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "events", label: "Events", icon: "📅" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <StatsOverview />;
      case "users":
        return <UsersManagement />;
      case "courses":
        return <CoursesManagement />;
      case "events":
        return <EventsManagement />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Analytics Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Here's your system overview.</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 