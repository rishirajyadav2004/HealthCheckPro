import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import "../styles/login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// Update successful login handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
    if (res.data && res.data.token && res.data.user) {
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("userId", res.data.user.id);
      
      // Initialize new assessment data for new users
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/assessment/initialize`,
          {},
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`
            }
          }
        );
      } catch (initError) {
        console.log("Assessment initialization skipped (may already exist)");
      }
      
      navigate("/dashboard");
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-main-container">
      <div className="login-left-section"></div>
      <div className="login-right-section">
        <div className="login-form-container">
          <h1 className="login-title">HealthCheckPro</h1>
          <p className="login-subtitle">Sign In to Continue!</p>
          
          {error && <p className="login-error-message">{error}</p>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Enter Email Address"
              onChange={handleChange}
              required
              className="login-input"
            />
            
            <div className="login-password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                onChange={handleChange}
                required
                className="login-input"
              />
              <span
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </span>
            </div>
            
            <button type="submit" disabled={loading} className="login-submit-button">
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
          
          <div className="login-links-container">
            <Link to="/forgot-password" className="login-link">
              Forgot Password?
            </Link>
            <p className="login-signup-text">
              Don't have an account? <Link to="/register" className="login-link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;