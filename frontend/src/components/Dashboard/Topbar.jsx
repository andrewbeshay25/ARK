import React, { useContext } from "react";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import "./DashStyles/Topbar.css";

const Topbar = () => {
   const { user } = useContext(AuthContext);
  
    // Function to determine greeting based on time of day
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 15) return "Good Afternoon";
      return "Good Evening";
    };

  return (
    <header className="topbar">
      <div className="flex items-center">
        {/* <button className="text-gray-600 focus:outline-none lg:hidden">
          <FiMenu size={24} />
        </button> */}
        {/* <div className="search-container">
          <input type="text" placeholder="    Search..." />
          <div className="search-icon">
            <FiSearch />
          </div>
        </div> */}
        <h1 className="title">{`${getGreeting()}, ${user?.firstName || "Guest"}!`}</h1>
      </div>
      <div className="icons">
        <button className="text-gray-600 focus:outline-none">
          <FiBell size={32} />
        </button>
        <div className="profile-avatar">A</div>
      </div>
    </header>
  );
};

export default Topbar;
