import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import { Link } from "react-router-dom";
import logo from "../assets/healthcheckpro-logo.webp"; // Adjust the path if needed


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
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

  const handleGoBack = () => {
    window.history.back(); // Go back to the previous page
  };

  return (
    <div className="forgot-password-page">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Health App Logo" className="app-logo" />
      </Link>
      <div className="forgot-password-box">
        <h2>Forgot Password</h2>
        <div className="input-groupp">
          <span className="icon">✉</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button onClick={handleReset}>Send Password Reset Link</button>
        <button className="go-back-btn" onClick={handleGoBack}>Go Back</button>
        {message && <p className="info-text">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
