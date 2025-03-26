import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/score.css";

const categories = ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"];

const ScorePage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userScores, setUserScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effectiveUserId, setEffectiveUserId] = useState(userId || '');

  // Get userId from localStorage if not provided
  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('healthCheckUserId');
      if (storedUserId) {
        setEffectiveUserId(storedUserId);
      }
    }
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (location.state?.userScore) {
          setUserScores(location.state.userScore);
        } else {
          const response = await axios.get(
            `http://localhost:5000/api/assessment/scores/${effectiveUserId || 'guest'}`
          );
          setUserScores(response.data.scores || {});
        }
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to load scores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (effectiveUserId) {
      fetchData();
    }
  }, [effectiveUserId, location.state]);

  const totalScore = categories.reduce((sum, category) => {
    return sum + (userScores[category] || 0);
  }, 0);

  const maxScore = 5 * 5 * 5;

  if (loading) {
    return (
      <div className="score-container">
        <h1>Your Assessment Scores</h1>
        <p className="loading-message">Loading scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="score-container">
        <h1>Your Assessment Scores</h1>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="score-container">
      <h1>Your Assessment Scores</h1>
      
      <div className="score-list">
        {categories.map((category, index) => {
          const score = userScores[category] || 0;
          const maxCategoryScore = 5 * 5;
          
          return (
            <div key={index} className="score-card">
              <h3>{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <p>
                Score: <strong>{score} / {maxCategoryScore}</strong>
              </p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(score / maxCategoryScore) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <h2>Total Score: {totalScore} / {maxScore}</h2>
      
      <div className="action-buttons">
        <button 
          className="dashboard-btn" 
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
        <button 
          className="retake-btn"
          onClick={() => navigate("/assessment")}
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
};

export default ScorePage;