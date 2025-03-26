import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaDumbbell, FaAppleAlt, FaBrain, FaHeartbeat, FaVial, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import '../styles/Dashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import logo from "../assets/healthcheckpro-logo.webp";

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [scores, setScores] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchUserData = async () => { 
        try {
            const userId = sessionStorage.getItem("userId"); // Make sure this matches storage
            if (!userId) {
                console.error("⚠ User ID not found in sessionStorage!");
                return;
            }
    
            console.log("Fetching user data for:", userId); // Debugging log
    
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
            console.log("API Response:", response.data);
    
            if (!response.data) {
                console.error("⚠ No user data received from API");
                return;
            }
    
            setUser(response.data); // Update state
        } catch (error) {
            console.error("❌ Error fetching user:", error.response?.data || error);
        }
    };
    
    
    

    const fetchScores = async () => {
        try {
            const userId = localStorage.getItem('userId');
    
            if (!userId) {
                console.error("User ID not found in localStorage");
                return;
            }
    
            const response = await axios.get(`http://localhost:5000/api/scores/${userId}`);
    
            if (response.data && response.data.scores) {
                setScores(response.data.scores);
            } else {
                console.warn("No scores found for user");
                setScores({});
            }
        } catch (error) {
            console.error("Error fetching scores:", error.response ? error.response.data : error.message);
        }
    };
    
    fetchUserData();
    fetchScores();
    
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate('/');
    };

    const categories = [
        { name: "Physical Fitness", icon: <FaDumbbell />, score: scores?.physical || 0 },
        { name: "Nutrition", icon: <FaAppleAlt />, score: scores?.nutrition || 0 },
        { name: "Mental Well-being", icon: <FaBrain />, score: scores?.mental || 0 },
        { name: "Lifestyle", icon: <FaHeartbeat />, score: scores?.lifestyle || 0 },
        { name: "Biomarkers", icon: <FaVial />, score: scores?.biomarkers || 0 }
    ];

    const handleStartAssessment = () => {
        navigate("/assessment"); // Redirect to the assessment page
      };

    return (
      <div className="dashboard-container">
      {/* ✅ Top Navigation Bar */}
      <nav className="top-nav">
        <div className="logo">
          <img src={logo} alt="Health Check Pro" className="nav-logo" />
          <span>Health Check Pro</span>
        </div>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="/dashboard">Dashboard</a>
          <a href="/assessment">Assessment</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/report">Report</a>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        {/* ✅ Mobile Menu Toggle */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </nav>

            {/* User Profile Section */}
            <div className="user-profile">
                <FaUserCircle className="profile-icon" />
                <div className="profile-info">
                    {user ? (
                    <>
                        <h2 className="user-name">{user.name || "N/A"}</h2>
                        <p><strong>Email:</strong> {user.email || "N/A"}</p>
                        <p><strong>Age:</strong> {user.age || "N/A"}</p>
                        <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
                    </>
                    ) : (
                    <p className="loading-text">Fetching user details...</p>
                    )}
                </div>
            </div>

            {/* Start New Challenge Section */}
            <div className="challenge-section">
                <div className="challenge-sub">
                <h3>Ready for a New Challenge?</h3>
                <p>Track your progress and improve your health with every step.</p>
                <button className="start-btn" onClick={handleStartAssessment}>Start New Round</button>
                </div>
            </div>

            {/* Health Categories with Charts */}
            <div className="health-categories">
                {categories.map((category, index) => (
                    <div key={index} className="category-card">
                        <div className="category-icon">{category.icon}</div>
                        <h4>{category.name}</h4>
                        <Doughnut
                            data={{
                                datasets: [
                                    {
                                        data: [category.score, 100 - category.score],
                                        backgroundColor: ["#4CAF50", "#E0E0E0"],
                                        borderWidth: 2,
                                    }
                                ],
                            }}
                            options={{ cutout: "70%" }}
                        />
                        <p>{category.score}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
