import React from "react";

const Home = () => {
  const firstName = localStorage.getItem("firstName");

  return (
    <div>
      <h1>Hello, {firstName}!</h1>
    </div>
  );
};

export default Home;
