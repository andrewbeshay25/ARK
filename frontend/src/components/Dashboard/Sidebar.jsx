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
        {/* Replace text with the image */}
        <img src={ArkBanner} alt="Ark Banner" className="banner-image" />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/home">
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
      <div className="footer">
        © 2025 ARK. All rights reserved.
      </div>
    </aside>
  );
};

export default Sidebar;
