import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ResetPassword.css";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/healthcheckpro-logo.webp";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  // ✅ Updated Password Validation (6-15 chars, uppercase, lowercase, number, special char)
  const isValidPassword = (password) => {
    const lengthValid = password.length >= 6 && password.length <= 15;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);

    return lengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  // Validation messages
  const passwordValidationMessages = {
    length: newPassword.length < 6 || newPassword.length > 15,
    uppercase: !/[A-Z]/.test(newPassword),
    lowercase: !/[a-z]/.test(newPassword),
    number: !/\d/.test(newPassword),
    specialChar: !/[\W_]/.test(newPassword),
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleResetPassword = async () => {
    if (!isValidPassword(newPassword) || !passwordsMatch) {
      setError("Password must be 6-15 characters, include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      <Link to="/" className="logo-container">
        <img src={logo} alt="Health App Logo" className="app-logo" />
      </Link>
      <div className="reset-password-box">
        <h2>Reset Password</h2>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

       
        {/* New Password Field */}
        <div className="input-group">
        <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
        />
        <span className="icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
            {showPassword ? <Eye /> : <EyeOff />}  {/* 🔥 FIX: Corrected Toggle Logic */}
        </span>
        </div>

        {/* Confirm Password Field */}
        <div className="input-group">
        <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <span className="icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
            {showConfirmPassword ? <Eye /> : <EyeOff />}  {/* 🔥 FIX: Corrected Toggle Logic */}
        </span>
        </div>

        
        {/* Simplified Validation Messages */}
        <div className="password-validation">
          {passwordValidationMessages.length && (
            <p className="error-text">❌ Password must be 6-15 characters.</p>
          )}
          {passwordValidationMessages.uppercase && (
            <p className="error-text">❌ At least one uppercase letter required.</p>
          )}
          {passwordValidationMessages.lowercase && (
            <p className="error-text">❌ At least one lowercase letter required.</p>
          )}
          {passwordValidationMessages.number && (
            <p className="error-text">❌ At least one number required.</p>
          )}
          {passwordValidationMessages.specialChar && (
            <p className="error-text">❌ At least one special character required.</p>
          )}
        </div>

        

        {/* Confirm Password Match Warning */}
        {!passwordsMatch && confirmPassword.length > 0 && <p className="error-text">Passwords do not match!</p>}

        {/* Reset Button */}
        <button
          onClick={handleResetPassword}
          disabled={!isValidPassword(newPassword) || !passwordsMatch}
          className={!isValidPassword(newPassword) || !passwordsMatch ? "disabled-btn" : ""}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
