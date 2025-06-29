// frontend/src/components/Dashboard/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBook, FaUser, FaCog } from "react-icons/fa";
import ArkBanner from "../../assets/Ark_Banner_Green.svg";
import "./DashStyles/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img 
          src={ArkBanner} 
          alt="ARK" 
          className="banner-image"
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Logo loaded successfully');
          }}
        />
      </div>
      <div className="sidebar-nav-wrapper">
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">
                <FaHome size={18} /> <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/courses">
                <FaBook size={18} /> <span>Courses</span>
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <FaUser size={18} /> <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/settings">
                <FaCog size={18} /> <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="footer">
        © 2025 ARK. All rights reserved.
      </div>
    </aside>
  );
};

export default Sidebar;
