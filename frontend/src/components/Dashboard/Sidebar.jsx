import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBook, FaUser, FaCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col items-center p-5">
      <h1 className="text-xl font-bold mb-10">ARK Dashboard</h1>
      <nav className="w-full">
        <Link to="/dashboard" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
          <FaHome /> Home
        </Link>
        <Link to="/courses" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
          <FaBook /> Courses
        </Link>
        <Link to="/profile" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
          <FaUser /> Profile
        </Link>
        <Link to="/settings" className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded">
          <FaCog /> Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
