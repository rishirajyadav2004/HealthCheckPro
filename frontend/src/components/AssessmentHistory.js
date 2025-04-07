import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaArrowRight, FaTrophy } from 'react-icons/fa';  // Removed unused FaChartLine
import '../styles/AssessmentHistory.css';

const AssessmentHistory = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const navigate = useNavigate();

// Add this useEffect hook to load data
useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        const response = await axios.get(`http://localhost:5000/api/assessment-history/${userId}`);
        setHistories(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const viewDetails = async (historyId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assessment-history/detail/${historyId}`);
      setSelectedHistory(response.data);
    } catch (error) {
      console.error('Error fetching assessment details:', error);
    }
  };

  const closeDetails = () => {
    setSelectedHistory(null);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <FaHistory className="history-icon" />
        <h2>Previous Assessments</h2>
        <button className="leaderboard-btn" onClick={() => navigate('/leaderboard')}>
          <FaTrophy /> View Leaderboard
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your assessment history...</div>
      ) : histories.length === 0 ? (
        <div className="no-history">
          <p>You haven't completed any assessments yet.</p>
          <button onClick={() => navigate('/assessment')}>Start Your First Assessment</button>
        </div>
      ) : (
        <>
          <div className="history-list">
            {histories.map((history) => (
              <div key={history._id} className="history-card">
                <div className="history-date">
                  {new Date(history.completedAt).toLocaleDateString()}
                </div>
                <div className="history-scores">
                  <div className="score-item">
                    <span>Overall</span>
                    <span className="score-value">{history.scores.Overall}%</span>
                  </div>
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => viewDetails(history._id)}
                >
                  <FaArrowRight /> Details
                </button>
              </div>
            ))}
          </div>

          {selectedHistory && (
            <div className="history-details-modal">
              <div className="modal-content">
                <button className="close-modal" onClick={closeDetails}>×</button>
                <h3>Assessment Details</h3>
                <div className="detail-date">
                  Completed on: {new Date(selectedHistory.completedAt).toLocaleString()}
                </div>
                
                <div className="detail-scores">
                  <h4>Scores</h4>
                  <div className="score-grid">
                    <div className="score-category">
                      <span>Physical Fitness</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${selectedHistory.scores.PhysicalFitness}%` }}
                        ></div>
                        <span>{selectedHistory.scores.PhysicalFitness}%</span>
                      </div>
                    </div>
                    <div className="score-category">
                      <span>Nutrition</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${selectedHistory.scores.Nutrition}%` }}
                        ></div>
                        <span>{selectedHistory.scores.Nutrition}%</span>
                      </div>
                    </div>
                    <div className="score-category">
                      <span>Mental Well-being</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${selectedHistory.scores.MentalWellBeing}%` }}
                        ></div>
                        <span>{selectedHistory.scores.MentalWellBeing}%</span>
                      </div>
                    </div>
                    <div className="score-category">
                      <span>Lifestyle</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${selectedHistory.scores.Lifestyle}%` }}
                        ></div>
                        <span>{selectedHistory.scores.Lifestyle}%</span>
                      </div>
                    </div>
                    <div className="score-category">
                      <span>Biomarkers</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill" 
                          style={{ width: `${selectedHistory.scores.Biomarkers}%` }}
                        ></div>
                        <span>{selectedHistory.scores.Biomarkers}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-responses">
                  <h4>Your Responses</h4>
                  {selectedHistory.responses.map((response, index) => (
                    <div key={index} className="response-item">
                      <div className="response-question">
                        <strong>{response.category}:</strong> {response.questionId}
                      </div>
                      <div className="response-answer">
                        <strong>Your answer:</strong> {JSON.stringify(response.answer)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentHistory;