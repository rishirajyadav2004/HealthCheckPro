import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaTrophy, FaUser, FaChartBar, FaDumbbell, 
  FaAppleAlt, FaBrain, FaHeartbeat, FaVial, FaCrown,
  FaAward, FaStar
} from 'react-icons/fa';
import '../styles/Leaderboard.css';

const DEFAULT_TOP_USERS = [
  { name: 'Aarav Sharma', score: 98, isDemo: true },
  { name: 'Priya Patel', score: 95, isDemo: true },
  { name: 'Rahul Singh', score: 93, isDemo: true },
  { name: 'Ananya Gupta', score: 91, isDemo: true },
  { name: 'Vihaan Reddy', score: 89, isDemo: true },
  { name: 'Ishaani Joshi', score: 87, isDemo: true },
  { name: 'Arjun Kumar', score: 85, isDemo: true },
  { name: 'Diya Iyer', score: 83, isDemo: true },
  { name: 'Krish Malhotra', score: 81, isDemo: true },
  { name: 'Meera Choudhary', score: 79, isDemo: true }
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [userPercentile, setUserPercentile] = useState(null);
  const [userScore, setUserScore] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const userId = sessionStorage.getItem('userId');
        
        // Get leaderboard data
        const endpoint = category === 'overall' 
          ? '/api/leaderboard/overall' 
          : `/api/leaderboard/category/${category}`;
        
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Process real users data
        const realUsers = response.data
          .filter(user => user.score !== null && user.score !== undefined)
          .map(user => ({
            ...user,
            isDemo: false,
            isCurrentUser: user.userId === userId,
            score: Math.round(user.score) // Ensure score is rounded
          }));

        // For overall leaderboard, use demo users with scores 79-98
        // For category leaderboards, scale demo scores to match category max (25)
        const demoUsers = DEFAULT_TOP_USERS.map(user => ({
          ...user,
          score: category === 'overall' ? user.score : Math.round(user.score * 0.25),
          isDemo: true,
          isCurrentUser: false
        }));

        // Combine demo users with real users
        let combinedLeaderboard = [...demoUsers, ...realUsers];

        // Sort by score descending
        combinedLeaderboard.sort((a, b) => b.score - a.score);

        // Remove duplicates (prioritize real users over demo users)
        const uniqueUsers = [];
        const namesSeen = new Set();
        
        combinedLeaderboard.forEach(user => {
          if (!namesSeen.has(user.name)) {
            namesSeen.add(user.name);
            uniqueUsers.push(user);
          }
        });

        setLeaderboard(uniqueUsers);

        // Find current user position
        const currentUserIndex = uniqueUsers.findIndex(
          user => user.isCurrentUser
        );
        
        if (currentUserIndex >= 0) {
          setUserPosition(currentUserIndex + 1);
          setUserScore(uniqueUsers[currentUserIndex].score);
          setUserPercentile(
            Math.round(((uniqueUsers.length - currentUserIndex) / uniqueUsers.length) * 100)
          );
        } else {
          // If user hasn't completed assessment, show them at the bottom
          setUserPosition(uniqueUsers.length + 1);
          setUserScore(0);
          setUserPercentile(0);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to showing just demo users with appropriate scaling
        const fallbackUsers = DEFAULT_TOP_USERS.map(user => ({
          ...user,
          score: category === 'overall' ? user.score : Math.round(user.score * 0.25),
          isDemo: true,
          isCurrentUser: false
        }));
        setLeaderboard(fallbackUsers);
        
        // Set user position to last if API fails
        setUserPosition(fallbackUsers.length + 1);
        setUserScore(0);
        setUserPercentile(0);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category]);

  const getCategoryTitle = () => {
    switch(category) {
      case 'PhysicalFitness': return 'Physical Fitness';
      case 'Nutrition': return 'Nutrition';
      case 'MentalWellBeing': return 'Mental Well-being';
      case 'Lifestyle': return 'Lifestyle';
      case 'Biomarkers': return 'Biomarkers';
      default: return 'Overall Leaderboard';
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return <FaCrown className="gold-crown" />;
    if (index === 1) return <FaAward className="silver-award" />;
    if (index === 2) return <FaStar className="bronze-star" />;
    return <span>{index + 1}</span>;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <FaTrophy className="trophy-icon" />
        <h2>{getCategoryTitle()}</h2>
        {userPosition && (
          <div className="user-stats">
            <span className="stat-item">
              <strong>Your Rank:</strong> #{userPosition}
            </span>
            <span className="stat-item">
              <strong>Your Score:</strong> {userScore}%
            </span>
            {userPercentile && (
              <span className="stat-item">
                <strong>Top:</strong> {userPercentile}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="category-selector">
        <button 
          className={category === 'overall' ? 'active' : ''}
          onClick={() => setCategory('overall')}
        >
          <FaChartBar /> Overall
        </button>
        <button 
          className={category === 'PhysicalFitness' ? 'active' : ''}
          onClick={() => setCategory('PhysicalFitness')}
        >
          <FaDumbbell /> Fitness
        </button>
        <button 
          className={category === 'Nutrition' ? 'active' : ''}
          onClick={() => setCategory('Nutrition')}
        >
          <FaAppleAlt /> Nutrition
        </button>
        <button 
          className={category === 'MentalWellBeing' ? 'active' : ''}
          onClick={() => setCategory('MentalWellBeing')}
        >
          <FaBrain /> Mental
        </button>
        <button 
          className={category === 'Lifestyle' ? 'active' : ''}
          onClick={() => setCategory('Lifestyle')}
        >
          <FaHeartbeat /> Lifestyle
        </button>
        <button 
          className={category === 'Biomarkers' ? 'active' : ''}
          onClick={() => setCategory('Biomarkers')}
        >
          <FaVial /> Biomarkers
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <>
          <div className="leaderboard-list">
            <div className="leaderboard-header-row">
              <span>Rank</span>
              <span>User</span>
              <span>Score</span>
            </div>
            
            {leaderboard.map((entry, index) => (
              <div 
                key={`${entry.name}-${index}`}
                className={`leaderboard-entry 
                  ${index < 3 ? 'podium-' + (index + 1) : ''}
                  ${!entry.isDemo && entry.isCurrentUser ? 'current-user' : ''}
                  ${entry.isDemo ? 'demo-user' : ''}`}
              >
                <div className="rank">
                  {getRankBadge(index)}
                </div>
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <span>
                    {entry.name}
                    {!entry.isDemo && entry.isCurrentUser && (
                      <span className="you-badge"> (You)</span>
                    )}
                    {entry.isDemo && (
                      <span className="demo-badge"> Top Performer</span>
                    )}
                  </span>
                </div>
                <div className="score">
                  {Math.round(entry.score)}%
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="no-entries">
                No entries found for this category. Complete your assessment to appear here!
              </div>
            )}
          </div>

          {userPosition && (
            <div className="performance-summary">
              <h3>Your Performance Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Your Rank</div>
                  <div className="summary-value">#{userPosition}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Participants</div>
                  <div className="summary-value">{leaderboard.length}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Your Score</div>
                  <div className="summary-value">{userScore}%</div>
                </div>
                {userPercentile && (
                  <div className="summary-item">
                    <div className="summary-label">Percentile</div>
                    <div className="summary-value">Top {userPercentile}%</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;