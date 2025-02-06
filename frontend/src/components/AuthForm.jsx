import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./AuthForm.css";  // Import the auth-specific CSS
import ArkLogo from "../assets/Full_Ark_Logo_Black.jpg"

const AuthForm = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, login: authLogin } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        if (password !== verifyPassword) {
          setError("Passwords do not match");
          return;
        }
        const data = await register(email, password, firstName, lastName);
        authLogin(data.access_token, data.firstName, data.user_role);
      } else {
        const data = await login(email, password);
        authLogin(data.access_token, data.firstName, data.user_role);
      }
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  return (
    <div className="auth-page">
      <div className="logo">
        {/* Replace text with the image */}
        <img src={ArkLogo} alt="Ark Banner" className="logo-image" />
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
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
                placeholder="Confirm Password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                required
              />
            )}
            <button type="submit">{isRegister ? "Sign Up" : "Log In"}</button>
          </form>
          <button className="switch-btn" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account? Log in" : "New user? Create an account"}
          </button>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <img src="/google-icon.png" alt="Google Logo" className="google-icon" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
