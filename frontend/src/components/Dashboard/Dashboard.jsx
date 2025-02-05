import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CourseList from "./CourseList";
import UpcomingSection from "./UpcomingSection";
import "./DashStyles/Dashboard.css"; // Adjust the path as needed

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <UpcomingSection />
          <div style={{ marginTop: "24px" }}>
            <CourseList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
