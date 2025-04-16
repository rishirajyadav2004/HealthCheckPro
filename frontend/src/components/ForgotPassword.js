import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";
import logo from "../assets/healthcheckpro-logo.webp";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("forgot-password-page");
    return () => {
      document.body.classList.remove("forgot-password-page");
    };
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="forgot-main-container">
      <div className="forgot-image-section"></div>

      <div className="forgot-form-section">
        <Link to="/" className="forgot-logo-container">
          <img src={logo} alt="Health App Logo" className="forgot-logo" />
        </Link>
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-subtitle">Enter your email to receive a reset link.</p>
        <form onSubmit={handleReset} className="forgot-form">
          <input
            type="email"
            className="forgot-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="forgot-submit-btn">
            Send Reset Link
          </button>
        </form>
        {message && <p className="forgot-message">{message}</p>}
        <p className="forgot-signup-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
        <Link to="/login" className="forgot-back-link">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;