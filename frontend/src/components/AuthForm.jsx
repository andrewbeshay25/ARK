import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const AuthForm = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState(""); // New field for password verification
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isAuthenticated, login: authLogin } = useContext(AuthContext);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  // Initialize Google Login
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "653690143303-gqvsfblr07tfm457rdsngmg2v7gvveud.apps.googleusercontent.com",
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Validate passwords match
        if (password !== verifyPassword) {
          setError("Passwords do not match");
          return;
        }
        const data = await register(email, password, firstName, lastName);
        authLogin(data.access_token, data.firstName); // Log in directly after registration
      } else {
        const data = await login(email, password);
        authLogin(data.access_token, data.firstName); // Log in after successful login
      }
      navigate("/home"); // Redirect to home after successful registration or login
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleGoogleLogin = async (response) => {
    const { credential } = response; // JWT from Google
    try {
      const result = await fetch("http://localhost:8000/auth/google/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      if (result.ok) {
        const data = await result.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("firstName", data.firstName);
        navigate("/home");
      } else {
        console.error("Google login failed");
      }
    } catch (err) {
      console.error("Error logging in with Google", err);
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Verify Password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
        )}
        <button type="submit">{isRegister ? "Register" : "Log In"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Switch to Log In" : "Switch to Register"}
      </button>
      <div id="google-login-button"></div>
    </div>
  );
};

export default AuthForm;
