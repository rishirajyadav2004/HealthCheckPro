import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [userId, setUserId] = useState(""); // Initialize with empty string

  const navigate = useNavigate();

  // Get userId from localStorage or generate a random one
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
      const formattedCategory = category.replace(/\s+/g, "");
      const res = await axios.get(
        `http://localhost:5000/api/assessment/questions/${formattedCategory}`
      );
      setQuestions(res.data);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    
    try {
      const res = await axios.get(
        `http://localhost:5000/api/assessment/progress/${userId}`
      );
      if (res.data) {
        const firstIncompleteIndex = categories.findIndex(
          (cat) => !res.data.completedCategories?.[cat]
        );
        
        setCurrentCategoryIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
        setCompletedCategories(res.data.completedCategories || {});
        setAnswers(res.data.answers || {});
        setUserScore(res.data.scores || {});
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchQuestions(categories[currentCategoryIndex]);
  }, [currentCategoryIndex, fetchQuestions]);

  const handleAnswerSelect = (questionId, selectedOption, points) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: { selectedOption, points },
    }));
  };

  const calculateScore = () => {
    let totalScore = Object.values(answers).reduce(
      (acc, answer) => acc + (answer.points || 0),
      0
    );
    setUserScore((prevScores) => ({
      ...prevScores,
      [categories[currentCategoryIndex]]: totalScore,
    }));
    return totalScore;
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    const totalScore = calculateScore();

    try {
      const result = await saveProgress(totalScore);
      
      if (result.nextCategory) {
        const nextIndex = categories.indexOf(result.nextCategory);
        setCurrentCategoryIndex(nextIndex);
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        navigate("/score", { state: { userScore: result.scores } });
      }
    } catch (error) {
      console.error("Progress save error:", error);
      alert("Failed to save progress. Please try again.");
    }
  };

  const saveProgress = async (totalScore) => {
    try {
      const currentCategory = categories[currentCategoryIndex];
      
      const response = await axios.post(
        "http://localhost:5000/api/assessment/save-progress",
        {
          userId,
          currentCategory,
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) =>
              questions.some((q) => q.id.toString() === key.toString())
            )
          ),
          scores: {
            ...userScore,
            [currentCategory]: totalScore,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error saving progress:", error);
      throw error;
    }
  };

  const resetAssessment = async () => {
    try {
      await axios.post(`http://localhost:5000/api/assessment/reset-assessment/${userId}`);
      setCurrentCategoryIndex(0);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCompletedCategories({});
      setUserScore({});
      fetchQuestions(categories[0]);
    } catch (error) {
      console.error("Error resetting assessment:", error);
    }
  };

  return (
    <div className="assessment-container">
      <nav className="assessment-navbar">
        <img src={logo} alt="Health Check Pro Logo" className="nav-logo" />
        <span className="nav-title">Health Check Pro</span>
        <button className="reset-btn" onClick={resetAssessment}>
          Reset Assessment
        </button>
      </nav>

      <div className="assessment-content">
        <div className="sidebar">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`sidebar-item ${
                completedCategories[category] ? "completed" : ""
              } ${index === currentCategoryIndex ? "active" : ""}`}
            >
              {category}
            </div>
          ))}
        </div>

        <div className="question-section">
          <h2>{categories[currentCategoryIndex]} Assessment</h2>
          {questions.length > 0 ? (
            <div className="question-box">
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
                >
                  {option}
                </button>
              ))}
              <button className="next-btn" onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"}
              </button>
            </div>
          ) : (
            <p>Loading questions...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;