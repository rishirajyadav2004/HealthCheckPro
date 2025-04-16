import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Dashboard.css';
import logo from "../assets/healthcheckpro-logo.webp";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [scores, setScores] = useState({
        PhysicalFitness: 0,
        MentalWellBeing: 0,
        Nutrition: 0,
        Lifestyle: 0,
        Biomarkers: 0
    });
    const [completedCategories, setCompletedCategories] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tips, setTips] = useState([]);
    const navigate = useNavigate();

    const getCategoryTips = (category, score) => {
        let level = 'low';
        if (score > 75) level = 'high';
        else if (score > 50) level = 'medium';
        
        const tipsData = {
            PhysicalFitness: {
                low: [
                    "Start with short walks daily to build stamina.",
                    "Consider beginner-level home workouts.",
                ],
                medium: [
                    "Incorporate strength training twice a week.",
                    "Increase your daily steps gradually.",
                ],
                high: [
                    "Keep up the great work! Try setting new personal records.",
                    "Maintain consistency with varied workouts.",
                ],
            },
            MentalWellBeing: {
                low: [
                    "Try 5-minute guided meditations daily.",
                    "Talk to a trusted friend or counselor.",
                ],
                medium: [
                    "Practice gratitude journaling each morning.",
                    "Take regular breaks and avoid burnout.",
                ],
                high: [
                    "Great mental balance! Keep doing what works.",
                    "Explore mindfulness retreats or advanced practices.",
                ],
            },
            Nutrition: {
                low: [
                    "Avoid processed foods and sugary drinks.",
                    "Plan simple, healthy meals in advance.",
                ],
                medium: [
                    "Try including more fruits and vegetables daily.",
                    "Watch portion sizes and balance meals.",
                ],
                high: [
                    "Your nutrition is on point! Keep exploring healthy recipes.",
                    "Share your healthy eating journey to inspire others.",
                ],
            },
            Lifestyle: {
                low: [
                    "Avoid late-night screen time and reduce caffeine.",
                    "Aim for at least 7 hours of sleep nightly.",
                ],
                medium: [
                    "Try a consistent sleep and wake schedule.",
                    "Incorporate active hobbies into your daily routine.",
                ],
                high: [
                    "Excellent lifestyle balance! Stay consistent.",
                    "You could try mentoring others toward healthier habits.",
                ],
            },
            Biomarkers: {
                low: [
                    "Consult your physician for a baseline checkup.",
                    "Monitor key vitals regularly with a health tracker.",
                ],
                medium: [
                    "Keep tracking improvements in cholesterol and BP.",
                    "Focus on steady habits that improve long-term metrics.",
                ],
                high: [
                    "Awesome! Your biomarkers are strong—maintain this momentum.",
                    "Make sure to stay consistent with checkups and data logs.",
                ],
            }
        };

        return tipsData[category][level];
    };

    const fetchData = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            const userId = sessionStorage.getItem('userId');
            
            if (!token || !userId) {
                navigate('/login');
                return;
            }

            const [userRes, progressRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/assessment/progress/${userId}`, {

                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (userRes.data) {
                setUser(userRes.data);
            }

            if (progressRes.data) {
                const scoresData = {
                    PhysicalFitness: 0,
                    MentalWellBeing: 0,
                    Nutrition: 0,
                    Lifestyle: 0,
                    Biomarkers: 0
                };
                let completedCount = 0;
                const newTips = [];

                progressRes.data.forEach(p => {
                    if (p.category in scoresData) {
                        const score = p.totalScore || 0;
                        scoresData[p.category] = score;
                        if (score > 0) {
                            completedCount++;
                            const percentage = Math.round((score / 25) * 100);
                            const categoryTips = getCategoryTips(p.category, percentage);
                            newTips.push({
                                category: p.category,
                                tips: categoryTips,
                                percentage: percentage
                            });
                        }
                    }
                });

                setScores(scoresData);
                setCompletedCategories(completedCount);
                setTips(newTips);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getGradient = (color, percent) => {
        return `conic-gradient(${color} 0% ${percent}%, #e5e7eb ${percent}% 100%)`;
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    const handleStartAssessment = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
    
            await axios.post(
                'http://localhost:5000/api/assessment/reset-assessment',
                {},
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                }
            );
    
            // Reset local state
            setScores({
                PhysicalFitness: 0,
                MentalWellBeing: 0,
                Nutrition: 0,
                Lifestyle: 0,
                Biomarkers: 0
            });
            setCompletedCategories(0);
            setTips([]);
            
            // Navigate with forceRefresh
            navigate("/assessment", { 
                state: { 
                    forceRefresh: true
                } 
            });
        } catch (error) {
            console.error("Error starting new assessment:", error);
            alert(`Failed to start new assessment: ${error.message}`);
        }
    };

    const handleContinueAssessment = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/assessment/current-progress',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (response.data.success) {
                const nextCategoryIndex = response.data.data.nextCategoryIndex;
                navigate("/assessment", {
                    state: {
                        continueAssessment: true,
                        startCategoryIndex: nextCategoryIndex
                    }
                });
            }
        } catch (error) {
            console.error("Error getting current progress:", error);
            // Fallback to starting from beginning if error occurs
            navigate("/assessment", { state: { continueAssessment: true } });
        }
    };

// Dashboard.js (update the handleProfileClick function)
const handleProfileClick = () => {
    navigate("/user-profile", { state: { user } }); // Pass user data as state
  };


    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (menuOpen && !event.target.closest('.nav-menu') && !event.target.closest('.menu-toggle')) {
            setMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, [menuOpen]);

    const handleViewCategory = (category) => {
        const categoryTips = tips.find(t => t.category === category);
        if (categoryTips) {
            alert(`${category} Tips (${categoryTips.percentage}%):\n\n${categoryTips.tips.join('\n\n')}`);
        } else {
            alert(`No data available for ${category}. Complete the assessment first.`);
        }
    };

    const showContinueButton = completedCategories > 0 && completedCategories < 5;
    const hasTakenTest = completedCategories > 0;

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="top-nav">
            <div className="nav-brand">
                <img src={logo} alt="Health Check Pro" className="nav-logo" />
                <span>Health Check Pro</span>
            </div>

            <button 
                className="menu-toggle" 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="Toggle navigation"
            >
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
                <NavLink 
                to="/dashboard" 
                className="nav-link" 
                onClick={() => setMenuOpen(false)}
                activeClassName="active"
                >
                Dashboard
                </NavLink>
                <NavLink 
                to="/assessment" 
                className="nav-link" 
                onClick={() => setMenuOpen(false)}
                activeClassName="active"
                >
                Assessment
                </NavLink>
                {/* <NavLink 
                to="/assessment-history" 
                className="nav-link" 
                onClick={() => setMenuOpen(false)}
                activeClassName="active"
                >
                History
                </NavLink> */}
                <NavLink 
                to="/leaderboard" 
                className="nav-link" 
                onClick={() => setMenuOpen(false)}
                activeClassName="active"
                >
                Leaderboard
                </NavLink>
                <NavLink 
                to="/score" 
                className="nav-link" 
                onClick={() => setMenuOpen(false)}
                activeClassName="active"
                >
                Health Report
                </NavLink>

                <div className="nav-actions">
                <button className="profile-btn" onClick={() => { handleProfileClick(); setMenuOpen(false); }}>
                    <FaUser className="btn-icon" />
                    <span>Profile</span>
                </button>
                <button className="logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                    <FaSignOutAlt className="btn-icon" />
                    <span>Logout</span>
                </button>
                </div>
            </div>
            </nav>

            <div className="dashboard-content">
                <div className="user-profile-section">
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
                                <p className="loading-text">User data not available</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-actions">
                    <div className="actions-section">
                        <div className="card actions">
                            <button onClick={handleStartAssessment} className="action-btn">Take New Assessment</button>
                            {showContinueButton && (
                                <button onClick={handleContinueAssessment} className="action-btn">
                                    Continue Assessment ({completedCategories}/5 completed)
                                </button>
                            )}
                        </div>

                        {hasTakenTest && tips.length > 0 && (
                            <div className="card tips-card">
                                <h3>💡 Personalized Tips</h3>
                                <ul>
                                {tips.map((item, idx) => (
                                    <li key={idx}>
                                        <strong>{item.category}:</strong> {item.tips[0]}
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="subtitle">Health Overview</h2>

                <div className="score-cards">
                    {['PhysicalFitness', 'MentalWellBeing', 'Nutrition', 'Lifestyle', 'Biomarkers'].map((category) => {
                        const score = scores[category] || 0;
                        const percentage = Math.round((score / 25) * 100);
                        const categoryName = category === 'PhysicalFitness' ? 'Physical Fitness' :
                                           category === 'MentalWellBeing' ? 'Mental Well-being' :
                                           category === 'Biomarkers' ? 'Bio Markers' : category;

                        return (
                            <div key={category} className="card">
                                <div className="score-circle-container">
                                    <div 
                                        className="score-circle" 
                                        style={{ 
                                            background: getGradient(
                                                {
                                                    PhysicalFitness: '#3b82f6',
                                                    MentalWellBeing: '#06b6d4',
                                                    Nutrition: '#fbbf24',
                                                    Lifestyle: '#a855f7',
                                                    Biomarkers: '#10b981'
                                                }[category], 
                                                percentage
                                            ) 
                                        }}
                                    >
                                        <span>{percentage}%</span>
                                    </div>
                                </div>
                                <div className="score-label">{categoryName}</div>
                                <div className="score-details">
                                    <p>Score: {score}/25</p>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: {
                                                    PhysicalFitness: '#3b82f6',
                                                    MentalWellBeing: '#06b6d4',
                                                    Nutrition: '#fbbf24',
                                                    Lifestyle: '#a855f7',
                                                    Biomarkers: '#10b981'
                                                }[category]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <button 
                                    className="view-button"
                                    onClick={() => handleViewCategory(category)}
                                >
                                    View Tips
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;