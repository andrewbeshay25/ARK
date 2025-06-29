import React, { useContext } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CourseList from "./CourseList";
import UpcomingSection from "./UpcomingSection";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import "./DashStyles/Dashboard.css"; // Adjust the path as needed

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // // Function to determine greeting based on time of day
  // const getGreeting = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 12) return "Good Morning";
  //   if (hour < 15) return "Good Afternoon";
  //   return "Good Evening";
  // };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          {/* <h1>{`${getGreeting()}, ${user?.firstName || "Guest"}!`}</h1> */}
          <UpcomingSection />
          <CourseList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
