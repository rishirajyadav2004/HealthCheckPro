import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaDumbbell, FaAppleAlt, FaBrain, FaHeartbeat, FaVial, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import '../styles/Dashboard.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import logo from "../assets/healthcheckpro-logo.webp";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [scores, setScores] = useState({});
    const [completedCategories, setCompletedCategories] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => { 
            try {
                const userId = sessionStorage.getItem("userId");
                if (!userId) {
                    console.error("⚠ User ID not found in sessionStorage!");
                    return;
                }
                
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error("❌ Error fetching user:", error.response?.data || error);
            }
        };

        const fetchProgress = async () => {
            try {
                const userId = localStorage.getItem('healthCheckUserId');
                if (!userId) return;
                
                // Fetch both scores and progress data
                const [scoresRes, progressRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/scores/${userId}`),
                    axios.get(`http://localhost:5000/api/assessment/progress/${userId}`)
                ]);
                
                // Update scores
                const scoresData = scoresRes.data?.scores || {};
                setScores(scoresData);
                
                // Calculate completed categories
                const completedCount = Object.values(scoresData).filter(score => score > 0).length;
                setCompletedCategories(completedCount);
                
                // Alternative way to get completion status from progress endpoint
                if (progressRes.data?.completedCategories) {
                    const completedFromProgress = Object.values(progressRes.data.completedCategories)
                        .filter(status => status).length;
                    setCompletedCategories(completedFromProgress);
                }
            } catch (error) {
                console.error("Error fetching progress:", error);
            }
        };
        
        fetchUserData();
        fetchProgress();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        sessionStorage.removeItem('userId');
        navigate('/');
    };

    const handleStartAssessment = async () => {
        try {
            const userId = localStorage.getItem('healthCheckUserId');
            if (!userId) return;
            
            await axios.post(`http://localhost:5000/api/assessment/reset-assessment/${userId}`);
            navigate("/assessment", { state: { forceRefresh: true } });
        } catch (error) {
            console.error("Error starting new assessment:", error);
        }
    };

    const categories = [
        { name: "Physical Fitness", icon: <FaDumbbell />, score: scores.PhysicalFitness || 0 },
        { name: "Nutrition", icon: <FaAppleAlt />, score: scores.Nutrition || 0 },
        { name: "Mental Well-being", icon: <FaBrain />, score: scores.MentalWellBeing || 0 },
        { name: "Lifestyle", icon: <FaHeartbeat />, score: scores.Lifestyle || 0 },
        { name: "Biomarkers", icon: <FaVial />, score: scores.Biomarkers || 0 }
    ];

    const handleContinueAssessment = () => {
        navigate("/assessment");
    };

    // Show continue button if at least one category is completed but not all
    const showContinueButton = completedCategories > 0 && completedCategories < 5;

    return (
        <div className="dashboard-container">
            <nav className="top-nav">
                <div className="logo">
                    <img src={logo} alt="Health Check Pro" className="nav-logo" />
                    <span>Health Check Pro</span>
                </div>
                <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                    <a href="/dashboard">Dashboard</a>
                    <a href="/assessment">Assessment</a>
                    <a href="/assessment-history">History</a>
                    <a href="/leaderboard">Leaderboard</a>
                    <a href="/score">Health Report</a>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
                <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>
            </nav>

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

            <div className="challenge-section">
                <div className="challenge-sub">
                    <h3>Ready for a New Challenge?</h3>
                    <p>Track your progress and improve your health with every step.</p>
                    <div className="assessment-buttons">
                        <button className="start-btn" onClick={handleStartAssessment}>Start New Round</button>
                        {showContinueButton && (
                            <button className="continue-btn" onClick={handleContinueAssessment}>
                                Continue Assessment ({completedCategories}/5 completed)
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="health-categories">
                {categories.map((category, index) => (
                    <div key={index} className={`category-card ${category.score > 0 ? 'completed' : ''}`}>
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