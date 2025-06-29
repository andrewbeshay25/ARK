import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { FiBell, FiSearch, FiLogOut } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import "./DashStyles/Topbar.css";

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Function to determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 15) return "Good Afternoon";
    return "Good Evening";
  };

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Dashboard pages - show greeting
    if (path === "/dashboard") {
      return `${getGreeting()}, ${user?.firstName || "Guest"}!`;
    }
    
    // Other pages - show page name
    if (path === "/courses") {
      return "Courses";
    }
    if (path === "/profile") {
      return "Profile";
    }
    if (path === "/settings") {
      return "Settings";
    }
    if (path === "/admin") {
      return "Admin Dashboard";
    }
    if (path.startsWith("/courses/")) {
      return "Course Dashboard";
    }
    
    // Default fallback
    return "Hello There";
  };

  return (
    <header className="topbar">
      <div className="flex items-center">
        <h1 className="title">
          {getPageTitle()}
        </h1>
      </div>
      <div className="icons">
        <button className="text-gray-600 focus:outline-none">
          <FiBell size={32} />
        </button>
        <button 
          className="logout-btn"
          onClick={logout}
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>
        <div className="profile-avatar">
          {user?.firstName?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
