import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaTrophy, 
  FaMedal, 
  FaUser, 
  FaChartBar,
  FaDumbbell,
  FaAppleAlt,
  FaBrain,
  FaHeartbeat,
  FaVial
} from 'react-icons/fa';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [userPercentile, setUserPercentile] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const endpoint = category === 'overall' 
          ? '/api/leaderboard/overall' 
          : `/api/leaderboard/category/${category}`;
        
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        setLeaderboard(response.data);
        
        // Calculate user position and percentile
        const userEntryIndex = response.data.findIndex(entry => entry.isCurrentUser);
        if (userEntryIndex !== -1) {
          const position = userEntryIndex + 1;
          setUserPosition(position);
          setUserPercentile(Math.round(((response.data.length - position) / response.data.length) * 100));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
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

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <FaTrophy className="trophy-icon" />
        <h2>{getCategoryTitle()}</h2>
        {userPosition && (
          <div className="user-stats">
            <span>Your Position: {userPosition}</span>
            {userPercentile && <span>Top {userPercentile}%</span>}
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
        <div className="loading">Loading leaderboard data...</div>
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
                key={entry.userId} 
                className={`leaderboard-entry 
                  ${index < 3 ? 'podium-' + (index + 1) : ''}
                  ${entry.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="rank">
                  {index < 3 ? (
                    <FaMedal className={`medal-${index + 1}`} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <span>
                    {entry.name}
                    {entry.isCurrentUser && <span className="you-badge"> (You)</span>}
                  </span>
                </div>
                <div className="score">
                  {Math.round(entry.score)}%
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="no-entries">
                No entries found for this category.
              </div>
            )}
          </div>

          {userPosition && (
            <div className="performance-summary">
              <h3>Your Performance Summary</h3>
              <p>
                You are ranked <strong>#{userPosition}</strong> out of {leaderboard.length} participants.
              </p>
              {userPercentile && (
                <p>You are in the top <strong>{userPercentile}%</strong> of all users!</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;