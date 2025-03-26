import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; 
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={location.pathname === "/dashboard" ? "dashboard-navbar" : "navbar"}>
      <div className="logo">Health Check Pro</div>

      {/* Hamburger Menu for Mobile */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/assessment" onClick={() => setMenuOpen(false)}>Assessment</Link></li>
        <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
        <li><Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link></li>
        <li className="profile-icon"><Link to="/profile" onClick={() => setMenuOpen(false)}>👤</Link></li>
        <li><button className="logout-btn" onClick={() => setMenuOpen(false)}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
