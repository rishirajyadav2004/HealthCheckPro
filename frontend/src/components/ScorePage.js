import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import "../styles/score.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const categories = [
  { key: "PhysicalFitness", name: "Physical Fitness", color: "#FF6384" },
  { key: "Nutrition", name: "Nutrition", color: "#36A2EB" },
  { key: "MentalWellBeing", name: "Mental Well-being", color: "#FFCE56" },
  { key: "Lifestyle", name: "Lifestyle", color: "#4BC0C0" },
  { key: "Biomarkers", name: "Biomarkers", color: "#9966FF" }
];

const getHealthReview = (totalScore) => {
  if (totalScore >= 100) return "Excellent! Your health is in great shape. Keep up the good habits!";
  if (totalScore >= 80) return "Good! You're doing well but there's room for improvement in some areas.";
  if (totalScore >= 60) return "Fair. Your health is average. Consider making some positive changes.";
  if (totalScore >= 40) return "Needs Improvement. Your health could benefit from significant changes.";
  return "Poor. It's recommended to consult a healthcare professional and make lifestyle changes.";
};

const ScorePage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userScores, setUserScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [effectiveUserId, setEffectiveUserId] = useState(userId || '');

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
    return sum + (userScores[category.key] || 0);
  }, 0);

  const maxScore = 5 * 5 * 5; // 5 categories * 5 questions * 5 max points per question


  const totalScoreData = {
    labels: ['Your Score', 'Remaining'],
    datasets: [
      {
        data: [totalScore, maxScore - totalScore],
        backgroundColor: ['#4CAF50', '#E0E0E0'],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const barChartData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Your Score',
        data: categories.map(cat => userScores[cat.key] || 0),
        backgroundColor: categories.map(cat => cat.color),
        borderColor: '#fff',
        borderWidth: 1,
        maxBarThickness: 40
      },
      {
        label: 'Max Possible',
        data: [25, 25, 25, 25, 25],
        backgroundColor: '#E0E0E0',
        borderColor: '#fff',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="score-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating your health report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="score-container">
        <div className="error-message">
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-container">
      <div className="report-header">
        <h1>Your Health Assessment Report</h1>
        <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="overall-score-section">
        <div className="total-score-chart">
          <h3>Overall Health Score</h3>
          <div className="chart-container">
            <Doughnut 
              data={totalScoreData} 
              options={{
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.raw} points`;
                      }
                    }
                  }
                },
                cutout: '70%'
              }} 
            />
          </div>
          <div className="score-summary">
            <h2>{totalScore} / {maxScore}</h2>
            <p className="health-review">{getHealthReview(totalScore)}</p>
          </div>
        </div>

        <div className="health-breakdown">
          <h3>Health Category Breakdown</h3>
          <div className="chart-container">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 25,
                    title: {
                      display: true,
                      text: 'Points'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.raw} points`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="category-scores-section">
        <h2>Detailed Category Analysis</h2>
        <div className="category-cards">
          {categories.map((category, index) => {
            const score = userScores[category.key] || 0;
            const percentage = Math.round((score / 25) * 100);
            
            return (
              <div key={index} className="category-cards">
                <h3>{category.name}</h3>
                <div className="category-chart">
                  <Doughnut 
                    data={{
                      labels: ['Score', 'Remaining'],
                      datasets: [{
                        data: [score, 25 - score],
                        backgroundColor: [category.color, '#F5F5F5'],
                        borderWidth: 0
                      }]
                    }} 
                    options={{
                      cutout: '75%',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.raw} points`;
                            }
                          }
                        }
                      }
                    }} 
                  />
                  <div className="chart-center-text">
                    <span>{percentage}%</span>
                  </div>
                </div>
                <div className="category-details">
                  <p><strong>Score:</strong> {score} / 25</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: category.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <div className="recommendations-grid">
          {categories.map((category, index) => {
            const score = userScores[category.key] || 0;
            let recommendation = '';
            
            if (score >= 20) {
              recommendation = `Excellent ${category.name} habits! Keep maintaining your current routine.`;
            } else if (score >= 15) {
              recommendation = `Good ${category.name} habits. Consider small improvements for better results.`;
            } else if (score >= 10) {
              recommendation = `Your ${category.name} needs attention. Focus on this area for better health.`;
            } else {
              recommendation = `Your ${category.name} requires significant improvement. Consider consulting a specialist.`;
            }
            
            return (
              <div key={index} className="recommendation-card" style={{ borderLeft: `4px solid ${category.color}` }}>
                <h4>{category.name}</h4>
                <p>{recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>

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