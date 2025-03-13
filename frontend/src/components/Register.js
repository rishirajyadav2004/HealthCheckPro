import React, { useState } from "react";
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
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const sendOTP = async () => {
    setError("");
    setSuccessMessage("");

    if (!formData.email) {
      setError("Please enter an email first.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email: formData.email });
      setSuccessMessage("OTP sent successfully! Check your email.");
      setOtpSent(true);
      setOtpVerified(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error sending OTP");
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
        const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { 
            email: formData.email, 
            otp: formData.otp 
        });

        setSuccessMessage(res.data.message);
        setOtpVerified(true); // ✅ OTP verified state is set to true
        setOtpSent(false); // ✅ Disable OTP input after successful verification

    } catch (error) {
        setError(error.response?.data?.message || "OTP verification failed");
    }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");

  if (!otpVerified) {
      setError("Please verify OTP before registering.");
      return;
  }

  try {
      await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
      });

      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
  } catch (error) {
      setError(error.response?.data?.message || "Error registering user");
  }
};


  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-box">
          <h2>
            Create Account <span className="user-icon">👤</span>
          </h2>

          <div className="social-signup">
            <button className="google-btn" onClick={() => window.open("https://accounts.google.com/signup", "_blank")}>
              <img src={googleIcon} alt="Google" /> Sign up with Google
            </button>

            <button className="facebook-btn" onClick={() => window.open("https://www.facebook.com/r.php", "_blank")}>
              <img src={facebookIcon} alt="Facebook" /> Sign up with Facebook
            </button>
          </div>

          <p className="or-text">or</p>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Enter your name" onChange={handleChange} required />
            <input type="number" name="age" placeholder="Enter your age" onChange={handleChange} required />
            <select name="gender" onChange={handleChange} required>
              <option value="">Select Your Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <div className="input-group">
              <img src={emailIcon} alt="Email" className="input-icon" />
              <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
            </div>
            <button type="button" className="otp-btn" onClick={sendOTP}>Send OTP</button>

            {otpSent && (
              <div className="otp-container">
                <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
                <button type="button" className="verify-btn" onClick={verifyOTP}>Verify OTP</button>
              </div>
            )}

            <div className="input-group">
              <img src={lockIcon} alt="Lock" className="input-icon" />
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
              <img
                src={passwordVisible ? eyeOpen : eyeClosed}
                alt="Toggle Password"
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              />
            </div>

            <p className="login-text">
              Already registered? <a href="/login" className="login-link">Login here</a>
            </p>

            <button type="submit" className="register-btn">Register</button>
          </form>
        </div>
      </div>
    </div>


    
  
  );
};

export default Register;