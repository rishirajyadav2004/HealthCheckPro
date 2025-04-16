import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/assessment.css";
import logo from "../assets/healthcheckpro-logo.webp";

// Import all required images directly
import E1 from '../assets/E1.jpg';
import E2 from '../assets/E2.jpg';
import E3 from '../assets/E3.jpg';
import E4 from '../assets/E4.jpg';
import E5 from '../assets/E5.jpg';
import F1 from '../assets/F1.jpg';
import F2 from '../assets/F2.jpg';
import F3 from '../assets/F3.jpg';
import F4 from '../assets/F4.jpg';
import F5 from '../assets/F5.jpg';
import S1 from '../assets/S1.jpg';
import S2 from '../assets/S2.jpg';
import S3 from '../assets/S3.jpg';
import S4 from '../assets/S4.jpg';
import S5 from '../assets/S5.jpg';
import M1 from '../assets/M1.jpg';
import M2 from '../assets/M2.jpg';
import M3 from '../assets/M3.jpg';
import M4 from '../assets/M4.jpg';
import M5 from '../assets/M5.jpg';
import L1 from '../assets/L1.jpg';
import L2 from '../assets/L2.jpg';
import L3 from '../assets/L3.jpg';
import L4 from '../assets/L4.jpg';
import L5 from '../assets/L5.jpg';
import placeholder from '../assets/placeholder.png';

// Create image mapping object
const imageMap = {
  E1, E2, E3, E4, E5,
  F1, F2, F3, F4, F5,
  S1, S2, S3, S4, S5,
  M1, M2, M3, M4, M5,
  L1, L2, L3, L4, L5,
  placeholder
};

const categories = ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"];

const AssessmentPage = () => {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completedCategories, setCompletedCategories] = useState({});
    const [userScore, setUserScore] = useState({});
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [showResetModal, setShowResetModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize user ID and fetch progress
    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          setUserId(userId);
        } else {
          navigate('/login'); // Redirect if not authenticated
        }
      }, [navigate]);

    const fetchQuestions = useCallback(async (category) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:5000/api/assessment/questions/${category}`
            );
            setQuestions(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
            setLoading(false);
        }
    }, []);

    // const fetchProgress = useCallback(async () => {
    //     if (!userId) return;
        
    //     try {
    //         setLoading(true);
    //         const res = await axios.get(
    //             `http://localhost:5000/api/assessment/progress/${userId}`
    //         );
            
    //         if (res.data) {
    //             setCompletedCategories(res.data.completedCategories || {});
    //             setUserScore(res.data.scores || {});
                
    //             // Find the first incomplete category
    //             const firstIncompleteIndex = categories.findIndex(
    //                 cat => !res.data.completedCategories?.[cat]
    //             );
                
    //             // If continuing assessment, start from first incomplete category
    //             const newIndex = location.state?.continueAssessment 
    //                 ? (firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0)
    //                 : 0;
                    
    //             setCurrentCategoryIndex(newIndex);
                
    //             const currentCategory = categories[newIndex];
    //             await fetchQuestions(currentCategory);
                
    //             const questionsRes = await axios.get(
    //                 `http://localhost:5000/api/assessment/questions/${currentCategory}`
    //             );
    //             const categoryQuestions = questionsRes.data;
                
    //             setAnswers(res.data.answers || {});
                
    //             if (res.data.answers) {
    //                 let firstUnansweredIndex = categoryQuestions.findIndex(
    //                     q => !res.data.answers[q.id]
    //                 );
                    
    //                 if (firstUnansweredIndex === -1 && !res.data.completedCategories[currentCategory]) {
    //                     firstUnansweredIndex = 0;
    //                 }
                    
    //                 setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
    //             } else {
    //                 setCurrentQuestionIndex(0);
    //             }
    //         }
    //         setLoading(false);
    //     } catch (error) {
    //         console.error("Error fetching progress:", error);
    //         setLoading(false);
    //     }
    // }, [userId, fetchQuestions, location.state?.continueAssessment]);


// Update the useEffect that handles initialization
useEffect(() => {
    const initializeAssessment = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            
            if (location.state?.forceRefresh) {
                // Reset all state for new assessment
                setCurrentCategoryIndex(0);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setCompletedCategories({});
                setUserScore({});
                await fetchQuestions(categories[0]);
            } else {
                // Get current progress
                const token = sessionStorage.getItem('token');
                const progressRes = await axios.get(
                    `http://localhost:5000/api/assessment/current-progress`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (progressRes.data.success) {
                    const progressData = progressRes.data.data;
                    
                    // Set completed categories and scores
                    setCompletedCategories(progressData.completedCategories);
                    setUserScore(progressData.scores);
                    
                    // Determine where to start
                    let startCategoryIndex = 0;
                    if (location.state?.continueAssessment) {
                        startCategoryIndex = location.state.startCategoryIndex || 
                                            progressData.nextCategoryIndex || 0;
                    }
                    
                    setCurrentCategoryIndex(startCategoryIndex);
                    await fetchQuestions(categories[startCategoryIndex]);
                    
                    // Set answers if any
                    setAnswers(progressData.answers || {});
                    
                    // Find first unanswered question in this category
                    const questionsRes = await axios.get(
                        `http://localhost:5000/api/assessment/questions/${categories[startCategoryIndex]}`
                    );
                    const categoryQuestions = questionsRes.data;
                    
                    let firstUnansweredIndex = categoryQuestions.findIndex(
                        q => !progressData.answers[q.id]
                    );
                    
                    setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
                }
            }
        } catch (error) {
            console.error("Initialization error:", error);
            // Fallback to starting from beginning
            setCurrentCategoryIndex(0);
            setCurrentQuestionIndex(0);
            await fetchQuestions(categories[0]);
        } finally {
            setLoading(false);
        }
    };

    initializeAssessment();
}, [userId, location.state, fetchQuestions]);
    

    const handleAnswerSelect = (questionId, selectedOption, points) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { selectedOption, points },
        }));
    };

    // const resetCurrentCategory = async () => {
    //     try {
    //         setLoading(true);
    //         const currentCategory = categories[currentCategoryIndex];
            
    //         if (!window.confirm(`Are you sure you want to reset your ${currentCategory.replace(/([A-Z])/g, ' $1').trim()} progress?`)) {
    //             setLoading(false);
    //             return;
    //         }
    
    //         // Reset only the current category's answers
    //         const updatedAnswers = {...answers};
    //         questions.forEach(q => {
    //             delete updatedAnswers[q.id];
    //         });
    
    //         // Update backend
    //         await axios.delete(
    //             `http://localhost:5000/api/assessment/reset-category/${userId}/${currentCategory}`
    //         );
            
    //         // Update state
    //         setAnswers(updatedAnswers);
    //         setCurrentQuestionIndex(0);
            
    //         // Fetch fresh questions
    //         await fetchQuestions(currentCategory);
            
    //         // Update completed categories
    //         const progressRes = await axios.get(
    //             `http://localhost:5000/api/assessment/progress/${userId}`
    //         );
            
    //         setCompletedCategories(progressRes.data.completedCategories || {});
    //         setUserScore(progressRes.data.scores || {});
            
    //     } catch (error) {
    //         console.error("Error resetting category:", error);
    //         alert(`Failed to reset category: ${error.message}`);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const calculateScore = () => {
    //     return Object.values(answers).reduce(
    //         (acc, answer) => acc + (answer.points || 0),
    //         0
    //     );
    // };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };


    

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            return;
        }
    
        try {
            setLoading(true);
            const currentCategory = categories[currentCategoryIndex];
            const token = sessionStorage.getItem('token');
            
            // Validate all questions are answered
            const unansweredQuestions = questions.filter(q => !answers[q.id]);
            if (unansweredQuestions.length > 0) {
                throw new Error(`Please answer all ${unansweredQuestions.length} remaining questions`);
            }
    
            // Calculate score
            const totalScore = Object.values(answers).reduce(
                (acc, answer) => acc + (answer.points || 0),
                0
            );

            const updatedScores = {
                ...userScore,
                [currentCategory]: totalScore
              };
              
              // Calculate overall average of completed categories
              const completedCategoryScores = Object.values(updatedScores);
              const overallScore = Math.round(completedCategoryScores.reduce((a, b) => a + b, 0) / completedCategoryScores.length);
              
    
            // Prepare answers payload
            const answersPayload = {};
            questions.forEach(question => {
                if (answers[question.id]) {
                    answersPayload[question.id] = {
                        selectedOption: String(answers[question.id].selectedOption),
                        points: Number(answers[question.id].points) || 0
                    };
                }
            });
    
            // Submit progress
            const response = await axios.post(
                "http://localhost:5000/api/assessment/save-progress",
                {
                  currentCategory,
                  answers: answersPayload,
                  scores: {
                    ...updatedScores,
                    Overall: overallScore
                  }
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
    
            // Handle response
            if (response.data.completedCategories) {
                setCompletedCategories(response.data.completedCategories);
                setUserScore(response.data.scores || {});
                
                // Find the first incomplete category
                const nextCategory = categories.find(
                    cat => !response.data.completedCategories[cat]
                );
                
                if (nextCategory) {
                    const nextIndex = categories.indexOf(nextCategory);
                    setCurrentCategoryIndex(nextIndex);
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                    await fetchQuestions(nextCategory);
                } else {
                    navigate("/score", { 
                        state: { 
                            scores: response.data.scores,
                            completedCategories: response.data.completedCategories 
                        } 
                    });
                }
                // Save assessment history when all categories are completed
                if (!nextCategory) {
                    await axios.post(
                        "http://localhost:5000/api/assessment-history",
                        {
                            scores: response.data.scores,
                            responses: Object.entries(answers).map(([questionId, answer]) => ({
                                questionId,
                                selectedOption: answer.selectedOption,
                                points: answer.points
                            }))
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                }
            }
        } catch (error) {
            console.error("Progress save error:", error);
            alert(`Error: ${error.response?.data?.message || error.message || "Failed to save progress"}`);
        } finally {
            setLoading(false);
        }
    };

    
    const resetAssessment = async () => {
        try {
            setLoading(true);
            await axios.post(`http://localhost:5000/api/assessment/reset-assessment/${userId}`);
            
            // Reset all state
            setCurrentCategoryIndex(0);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setCompletedCategories({});
            setUserScore({});
            
            // Fetch fresh questions for the first category
            await fetchQuestions(categories[0]);
            setShowResetModal(false);
            
        } catch (error) {
            console.error("Error resetting assessment:", error);
            alert(`Failed to reset assessment: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // const calculateProgress = () => {
    //     if (questions.length === 0) return 0;
    //     const answeredCount = questions.filter(q => answers[q.id]).length;
    //     return (answeredCount / questions.length) * 100;
    // };

    if (loading) {
        return (
            <div className="assessment-container">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading assessment...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex] || {};
    const imageKey = currentQuestion.image ? currentQuestion.image.replace('.jpg', '') : 'placeholder';
    const questionImage = imageMap[imageKey] || imageMap.placeholder;

    return (
        <div className="assessment-container">
            {showResetModal && (
                <div className="reset-modal-overlay">
                    <div className="reset-modal">
                        <h3>Reset All Progress</h3>
                        <p>Are you sure you want to reset all assessment progress? This action cannot be undone.</p>
                        <div className="reset-modal-buttons">
                            <button 
                                className="reset-modal-cancel"
                                onClick={() => setShowResetModal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                className="reset-modal-confirm"
                                onClick={resetAssessment}
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Confirm Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="assessment-navbar">
                <img src={logo} alt="Health Check Pro Logo" className="nav-logo" />
                <span className="nav-title">Health Check Pro</span>
                {/* <div className="reset-buttons">
                    <button 
                        className="reset-btn" 
                        onClick={resetCurrentCategory} 
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Current Category"}
                    </button>
                    <button 
                        className="reset-btn reset-all-btn" 
                        onClick={() => setShowResetModal(true)} 
                        disabled={loading}
                    >
                        Reset All
                    </button>
                </div> */}
            </nav>

            <div className="assessment-content">
                <div className="sidebar">
                    {categories.map((category, index) => {
                        const isCompleted = completedCategories[category];
                        const isActive = index === currentCategoryIndex;
                        
                        return (
                            <div
                                key={index}
                                className={`sidebar-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                                onClick={() => {
                                    if (isCompleted || index <= currentCategoryIndex) {
                                        setCurrentCategoryIndex(index);
                                        fetchQuestions(category);
                                    }
                                }}
                            >
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                                {isCompleted && <span className="checkmark">✓</span>}
                            </div>
                        );
                    })}
                </div>

                <div className="question-section">
                    <div className="category-header">
                        <h2>{categories[currentCategoryIndex].replace(/([A-Z])/g, ' $1').trim()} Assessment</h2>
                        <div className="progress-text">
                            {Object.values(completedCategories).filter(Boolean).length} of {categories.length} categories completed
                        </div>
                    </div>
                    
                    {questions.length > 0 ? (
                        <div className="question-box">
                            <div className="progress-indicator">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </div>
                            
                            {/* Progress Bar */}
                            {/* Progress Bar */}
                            <div className="progress-container">
                            <div className="progress-track">
                                <div 
                                    className="progress-fills" 
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                ></div>
                            </div>
                            <div className="progress-dots">
                                {questions.map((_, index) => (
                                    <div 
                                        key={index}
                                        className={`progress-dot ${currentQuestionIndex >= index ? 'active' : ''}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                            
                            <div className="question-layout-container">
                                <div className="image-column">
                                    <div className="question-image-container">
                                        <img 
                                            src={questionImage}
                                            alt={currentQuestion.question || 'Question image'}
                                            className="question-image"
                                            onError={(e) => {
                                                e.target.src = imageMap.placeholder;
                                                e.target.alt = 'Placeholder image';
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="content-column">
                                    <div className="question-text-container">
                                        <p>{currentQuestion.question}</p>
                                    </div>

                                    <div className="options-scroll-container">
                                        <div className="options-container">
                                            {currentQuestion.options?.map((option, index) => (
                                                <label
                                                    key={index}
                                                    className="option-radio"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={currentQuestion.id}
                                                        value={option}
                                                        checked={answers[currentQuestion.id]?.selectedOption === option}
                                                        onChange={() =>
                                                            handleAnswerSelect(
                                                                currentQuestion.id,
                                                                option,
                                                                currentQuestion.points[index]
                                                            )
                                                        }
                                                    />
                                                    <span className="option-text">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="navigation-buttons">
                                <button 
                                    className="nav-btn prev-btn"
                                    onClick={handlePreviousQuestion}
                                    disabled={currentQuestionIndex === 0 || loading}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="nav-btn next-btn" 
                                    onClick={handleNextQuestion}
                                    disabled={loading || !answers[currentQuestion.id]}
                                >
                                    {currentQuestionIndex < questions.length - 1 
                                        ? loading ? "Loading..." : "Next" 
                                        : loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>No questions available for this category.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;