import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Ensures Bootstrap is applied
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Assessment from "./components/Assessment"; // ✅ Import Assessment Page
import ScorePage from "./components/ScorePage";
import AssessmentHistory from "./components/AssessmentHistory";
import Leaderboard from "./components/Leaderboard";


const NotFound = () => <h2 className="text-center mt-5">404 - Page Not Found</h2>;

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assessment" element={<Assessment />} /> {/* ✅ Added Route */}
                <Route path="*" element={<NotFound />} /> {/* Handles invalid URLs */}
                <Route path="/score" element={<ScorePage />} />
                <Route path="/assessment-history" element={<AssessmentHistory />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </Router>
    );
};

export default App;
