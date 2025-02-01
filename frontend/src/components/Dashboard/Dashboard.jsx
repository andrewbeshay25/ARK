import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CourseList from "./CourseList";

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 bg-gray-100 flex-1">
          <CourseList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
