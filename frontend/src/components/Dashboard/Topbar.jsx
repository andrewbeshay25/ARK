import React from "react";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import "./DashStyles/Topbar.css";

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="flex items-center">
        <button className="text-gray-600 focus:outline-none lg:hidden">
          <FiMenu size={24} />
        </button>
        <div className="search-container">
          <input type="text" placeholder="    Search..." />
          <div className="search-icon">
            <FiSearch />
          </div>
        </div>
      </div>
      <div className="icons">
        <button className="text-gray-600 focus:outline-none">
          <FiBell size={24} />
        </button>
        <div className="profile-avatar">A</div>
      </div>
    </header>
  );
};

export default Topbar;
