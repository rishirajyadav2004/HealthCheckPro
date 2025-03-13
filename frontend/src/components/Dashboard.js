import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login"); // 🔹 Redirect to login if no token is found
        }
    }, [navigate]);

    return (
        <div style={{
            textAlign: "center",
            marginTop: "50px",
            backgroundColor: "#121212",
            color: "white",
            height: "100vh",
            padding: "20px"
        }}>
            <h2>Welcome to the Dashboard</h2>
            <p>Your health tracking starts here!</p>
        </div>
    );
};

export default Dashboard;
