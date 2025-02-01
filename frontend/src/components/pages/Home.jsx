import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Hello, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
