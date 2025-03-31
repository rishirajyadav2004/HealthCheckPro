import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/assessment.css";
import logo from "../assets/healthcheckpro-logo.webp";

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
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize user ID and fetch progress
    useEffect(() => {
        const storedUserId = localStorage.getItem('healthCheckUserId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('healthCheckUserId', newUserId);
            setUserId(newUserId);
        }
    }, []);

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

    const fetchProgress = useCallback(async () => {
        if (!userId) return;
        
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:5000/api/assessment/progress/${userId}`
            );
            
            if (res.data) {
                setCompletedCategories(res.data.completedCategories || {});
                setUserScore(res.data.scores || {});
                
                // Find first incomplete category
                const firstIncompleteIndex = categories.findIndex(
                    cat => !res.data.completedCategories?.[cat]
                );
                
                const newIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
                setCurrentCategoryIndex(newIndex);
                
                // Load questions for the current category
                const currentCategory = categories[newIndex];
                await fetchQuestions(currentCategory);
                
                // Wait for questions to load before setting answers and current question index
                const questionsRes = await axios.get(
                    `http://localhost:5000/api/assessment/questions/${currentCategory}`
                );
                const categoryQuestions = questionsRes.data;
                
                // Set answers from progress data
                setAnswers(res.data.answers || {});
                
                // Find the first unanswered question in this category
                if (res.data.answers) {
                    let firstUnansweredIndex = categoryQuestions.findIndex(
                        q => !res.data.answers[q.id]
                    );
                    
                    // If all questions are answered but category isn't marked complete
                    // (maybe user didn't click submit), start from first question
                    if (firstUnansweredIndex === -1 && !res.data.completedCategories[currentCategory]) {
                        firstUnansweredIndex = 0;
                    }
                    
                    setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
                } else {
                    setCurrentQuestionIndex(0);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching progress:", error);
            setLoading(false);
        }
    }, [userId, fetchQuestions]);

    useEffect(() => {
        if (userId) {
            if (location.state?.forceRefresh) {
                // Reset state for new assessment
                setCurrentCategoryIndex(0);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setCompletedCategories({});
                setUserScore({});
                fetchQuestions(categories[0]);
            } else {
                fetchProgress();
            }
        }
    }, [userId, location.state, fetchProgress, fetchQuestions]);

    const handleAnswerSelect = (questionId, selectedOption, points) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { selectedOption, points },
        }));
    };



    const resetCurrentCategory = async () => {
        try {
            setLoading(true);
            const currentCategory = categories[currentCategoryIndex];
            
            // Confirm with user before resetting
            if (!window.confirm(`Are you sure you want to reset your ${currentCategory.replace(/([A-Z])/g, ' $1').trim()} progress?`)) {
                setLoading(false);
                return;
            }
    
            // Delete only the current category's progress
            await axios.delete(
                `http://localhost:5000/api/assessment/reset-category/${userId}/${currentCategory}`
            );
            
            // Reset local state for this category
            setAnswers({});
            setCurrentQuestionIndex(0);
            
            // Refresh questions
            await fetchQuestions(currentCategory);
            
            // Update completed categories
            const progressRes = await axios.get(
                `http://localhost:5000/api/assessment/progress/${userId}`
            );
            setCompletedCategories(progressRes.data.completedCategories || {});
            
        } catch (error) {
            console.error("Error resetting category:", error);
            alert(`Failed to reset category: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const calculateScore = () => {
        return Object.values(answers).reduce(
            (acc, answer) => acc + (answer.points || 0),
            0
        );
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            return;
        }
      
        const totalScore = calculateScore();
      
        try {
            setLoading(true);
            const currentCategory = categories[currentCategoryIndex];
            
            // Verify all questions are answered
            const unansweredQuestions = questions.filter(q => !answers[q.id]);
            if (unansweredQuestions.length > 0) {
                throw new Error(`Please answer all ${unansweredQuestions.length} remaining questions`);
            }
      
            const answersPayload = {};
            questions.forEach(question => {
                if (answers[question.id]) {
                    answersPayload[question.id] = {
                        selectedOption: String(answers[question.id].selectedOption),
                        points: Number(answers[question.id].points) || 0
                    };
                }
            });
      
            const response = await axios.post(
                "http://localhost:5000/api/assessment/save-progress",
                {
                    userId,
                    currentCategory,
                    answers: answersPayload,
                    scores: {
                        ...userScore,
                        [currentCategory]: totalScore
                    }
                }
            );
      
            if (response.data.nextCategory) {
                const nextIndex = categories.indexOf(response.data.nextCategory);
                setCurrentCategoryIndex(nextIndex);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setCompletedCategories(response.data.completedCategories);
                await fetchQuestions(response.data.nextCategory);
            } else {
                navigate("/score", { 
                    state: { 
                        userScore: response.data.scores,
                        completedCategories: response.data.completedCategories 
                    } 
                });
            }
        } catch (error) {
            console.error("Progress save error:", error);
            alert(`Error: ${error.message || "Failed to save progress"}`);
        } finally {
            setLoading(false);
        }
    };

    const resetAssessment = async () => {
        try {
            setLoading(true);
            await axios.post(`http://localhost:5000/api/assessment/reset-assessment/${userId}`);
            setCurrentCategoryIndex(0);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setCompletedCategories({});
            setUserScore({});
            await fetchQuestions(categories[0]);
        } catch (error) {
            console.error("Error resetting assessment:", error);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="assessment-container">
            <nav className="assessment-navbar">
                <img src={logo} alt="Health Check Pro Logo" className="nav-logo" />
                <span className="nav-title">Health Check Pro</span>
                <div className="reset-buttons">
                    <button 
                        className="reset-btn" 
                        onClick={resetCurrentCategory} 
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Current Category"}
                    </button>
                    <button 
                        className="reset-btn reset-all-btn" 
                        onClick={resetAssessment} 
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset All"}
                    </button>
                </div>
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
                            <p>{questions[currentQuestionIndex].question}</p>
                            {questions[currentQuestionIndex].options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-btn ${
                                        answers[questions[currentQuestionIndex].id]?.selectedOption === option
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleAnswerSelect(
                                            questions[currentQuestionIndex].id,
                                            option,
                                            questions[currentQuestionIndex].points[index]
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {option}
                                </button>
                            ))}
                            <button 
                                className="next-btn" 
                                onClick={handleNextQuestion}
                                disabled={loading || !answers[questions[currentQuestionIndex].id]}
                            >
                                {currentQuestionIndex < questions.length - 1 
                                    ? loading ? "Loading..." : "Next" 
                                    : loading ? "Submitting..." : "Submit"}
                            </button>
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