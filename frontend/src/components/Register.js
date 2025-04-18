import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

import googleIcon from "../assets/google-icon.png";
import facebookIcon from "../assets/facebook-icon.png";
import emailIcon from "../assets/email.png";
import lockIcon from "../assets/lock.png";
import eyeOpen from "../assets/oeye.png";
import eyeClosed from "../assets/eye.png";

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  useEffect(() => {
    document.body.classList.add("register-page");
    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value.trim(),
    }));

    if (e.target.name === "password") validatePassword(e.target.value);
    if (e.target.name === "confirmPassword") validateConfirmPassword(e.target.value);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("⚠ Password must be at least 8 characters, contain one uppercase letter, one lowercase letter, one number, and one special character.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      setConfirmPasswordError("⚠ Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const sendOTP = async () => {
    setError("");
    setSuccessMessage("");

    if (!formData.email) {
      setError("Please enter an email first.");
      return;
    }

    try {
      setIsLoading(true);
      axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, 
        { email: formData.email },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setSuccessMessage("OTP sent successfully! Check your email.");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    setSuccessMessage("");

    if (!formData.otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });

      setSuccessMessage(res.data.message);
      setOtpVerified(true);
      setOtpSent(false);
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    for (let key in formData) {
      if (formData[key] === "" && key !== "otp") {
        setError("All fields are required!");
        setIsLoading(false);
        return;
      }
    }

    if (!otpVerified) {
      setError("Please verify OTP before registering.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must meet complexity requirements.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, formData);
      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error registering user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-main-container">
      <div className="register-left-section"></div>

      <div className="register-right-section">
        <div className="register-form-container">
          <div className="register-form-box">
            <h2 className="register-title">
              Create Account <span className="register-user-icon">👤</span>
            </h2>

            <div className="social-signup">
              <button className="google-btn" onClick={() => window.open("https://accounts.google.com/signup", "_blank")}>
                <img src={googleIcon} alt="Google" /> Create Account with Google
              </button>

              <button className="facebook-btn" onClick={() => window.open("https://www.facebook.com/r.php", "_blank")}>
                <img src={facebookIcon} alt="Facebook" /> Create Account with Facebook
              </button>
            </div>

            <p className="register-or-text">or</p>
            {error && <p className="register-error-message">{error}</p>}
            {successMessage && <p className="register-success-message">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-input-group">
                <input type="text" name="name" placeholder="Enter your name" onChange={handleChange} required />
              </div>
              <div className="register-input-group">
                <input type="number" name="age" placeholder="Enter your age" onChange={handleChange} required />
              </div>
              <select name="gender" onChange={handleChange} required className="register-select">
                <option value="">Select Your Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="register-input-group">
                <input type="text" name="username" placeholder="Enter your username (no spaces)" onChange={handleChange} pattern="\S+" title="Username should not contain spaces" required />
              </div>
              <div className="register-input-group">
                <img src={emailIcon} alt="Email" className="register-input-icon" />
                <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
              </div>
              <button type="button" className="register-otp-btn" onClick={sendOTP} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </button>

              {otpSent && (
                <div className="register-otp-container">
                  <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
                  <button type="button" className="register-verify-btn" onClick={verifyOTP} disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              <div className="register-input-group">
                <img src={lockIcon} alt="Lock" className="register-input-icon" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={handleChange}
                  required
                />
                <img
                  src={passwordVisible ? eyeOpen : eyeClosed}
                  alt="Toggle Password"
                  className="register-toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                />
              </div>
              {isPasswordFocused && passwordError && <p className="register-password-error">{passwordError}</p>}

              <div className="register-input-group">
                <img src={lockIcon} alt="Lock" className="register-input-icon" />
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  onChange={handleChange}
                  required
                />
                <img
                  src={confirmPasswordVisible ? eyeOpen : eyeClosed}
                  alt="Toggle Password"
                  className="register-toggle-password"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                />
              </div>
              {isConfirmPasswordFocused && confirmPasswordError && <p className="register-password-error">{confirmPasswordError}</p>}

              <button type="submit" className="register-submit-btn" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="register-login-text">
              Already registered? <a href="/login" className="register-login-link">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;