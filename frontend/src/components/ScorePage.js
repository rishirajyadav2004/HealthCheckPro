import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const EMPTY_SCORE_MESSAGE = "You haven't completed the health assessment yet. Complete the assessment to get your personalized health report with detailed insights and recommendations.";

const getHealthReview = (totalScore) => {
  if (totalScore >= 100) return "Excellent! Your health is in great shape. Keep up the good habits!";
  if (totalScore >= 80) return "Good! You're doing well but there's room for improvement in some areas.";
  if (totalScore >= 60) return "Fair. Your health is average. Consider making some positive changes.";
  if (totalScore >= 40) return "Needs Improvement. Your health could benefit from significant changes.";
  return "Poor. It's recommended to consult a healthcare professional and make lifestyle changes.";
};

const getCategoryTips = (category, score) => {
  let level = 'low';
  if (score > 75) level = 'high';
  else if (score > 50) level = 'medium';
  
  const tips = {
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

  return tips[category][level];
};

const ScorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userScores, setUserScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const storedUserId = sessionStorage.getItem('userId');
        
        if (!token || !storedUserId) {
          navigate('/login');
          return;
        }

        setUserId(storedUserId);

        // First check for scores in location state (from just completed assessment)
        if (location.state?.scores) {
          setUserScores(location.state.scores);
          return;
        }

        // If no scores in location state, fetch from API
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assessment/scores/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data?.scores) {
          setUserScores(response.data.scores);
        } else {
          setUserScores({});
        }
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to load scores. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, navigate]);

  const totalScore = categories.reduce((sum, category) => {
    return sum + (userScores[category.key] || 0);
  }, 0);

  // Check if we have valid scores to display
  const hasScores = Object.keys(userScores).length > 0 && 
                   !categories.every(category => (userScores[category.key] || 0) === 0);

  // Prepare chart data
  const maxScore = 5 * 5 * 5;
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

  if (!hasScores) {
    return (
      <div className="score-container">
        <div className="empty-score-message">
          <h2>No Assessment Results Found</h2>
          <p>{EMPTY_SCORE_MESSAGE}</p>
          <div className="empty-score-illustration">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <button 
            className="take-assessment-btn"
            onClick={() => navigate("/assessment")}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-container">
      <div className="report-header">
        <h1>Your Health Assessment Report</h1>
        <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
        <p className="user-id">User ID: {userId}</p>
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
            const tips = getCategoryTips(category.key, percentage);
            
            return (
              <div key={index} className="category-card">
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
                <div className="category-tips">
                  <h4>Personalized Tips:</h4>
                  <ul>
                    {tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
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
          onClick={async () => {
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
              
              navigate("/assessment", { 
                state: { 
                  forceRefresh: true
                } 
              });
            } catch (error) {
              console.error("Error starting new assessment:", error);
              alert(`Failed to start new assessment: ${error.message}`);
            }
          }}
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
};

export default ScorePage;