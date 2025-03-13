import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LandingPage.css"; // Ensure this file exists with styles
import logo from "../assets/healthcheckpro-logo.webp"; // Ensure logo exists

const LandingPage = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

    // Persist theme preference
    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    return (
        <div className={`landing-page ${darkMode ? "dark-mode" : "light-mode"}`}>
            {/* ✅ Navbar */}
            <nav className="navbar">
                <img src={logo} alt="HealthCheckPro Logo" className="logo" />
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li>
                        <button className="theme-toggle" onClick={() => setDarkMode(prev => !prev)}>
                            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                    </li>
                </ul>
            </nav>

            {/* ✅ Hero Section */}
            <header className="hero">
                <h1>Track Your Health with <span>HealthCheckPro</span></h1>
                <p>Your all-in-one solution for health assessment and tracking.</p>
                <button className="get-started" onClick={() => navigate("/register")}>
                    Get Started
                </button>
            </header>

            {/* ✅ Features Section */}
            <section className="features">
                <h2>Why Choose HealthCheckPro?</h2>
                <div className="feature-grid">
                    <div className="feature-card">✔️ Personalized Health Reports</div>
                    <div className="feature-card">✔️ Track Your Progress</div>
                    <div className="feature-card">✔️ Mental & Physical Health Analysis</div>
                    <div className="feature-card">✔️ Easy-to-Use Dashboard</div>
                </div>
            </section>

            {/* ✅ Footer */}
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} HealthCheckPro. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
