import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/api";

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(username, password, firstName, lastName);
        setError("Registration successful! Please log in.");
        setIsRegister(false);
      } else {
        const data = await login(username, password);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("firstName", data.firstName); // Assuming the backend returns this
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-form">
      <h2>{isRegister ? "Register" : "Log In"}</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? "Register" : "Log In"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Switch to Log In" : "Switch to Register"}
      </button>
    </div>
  );
};

export default AuthForm;
