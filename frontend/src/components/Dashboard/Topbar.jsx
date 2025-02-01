import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";

const Topbar = () => {
  return (
    <header className="w-full bg-white p-4 shadow flex items-center justify-between">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="flex items-center gap-4">
        <input type="text" placeholder="Search..." className="p-2 border rounded" />
        <FaSearch className="cursor-pointer" />
        <FaBell className="cursor-pointer text-gray-500" />
      </div>
    </header>
  );
};

export default Topbar;
