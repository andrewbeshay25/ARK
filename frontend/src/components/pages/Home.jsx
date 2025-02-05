import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Hello, {user.firstName}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="home-content">
        <p>
          Welcome to your dashboard. Here you can view your courses, upcoming events, assignments, quizzes, and more.
        </p>
      </div>
    </div>
  );
};

export default Home;
