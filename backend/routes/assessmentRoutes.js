const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const UserProgress = require("../models/UserProgress");
const router = express.Router();

// Load questions from JSON file
const questionsPath = path.join(__dirname, "../data/questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

const categories = ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"];

// Middleware to validate user ID
const validateUser = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: "Valid user ID is required",
      received: userId
    });
  }
  next();
};

// GET questions by category
router.get("/questions/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!questions[category]) {
      return res.status(404).json({ 
        message: "Category not found",
        success: false 
      });
    }
    res.json(questions[category]);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching questions", 
      error: error.message,
      success: false 
    });
  }
});

router.post("/save-progress", validateUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { userId, currentCategory, answers, scores } = req.body;

    // Validate required fields
    if (!userId || !currentCategory || !answers || !scores) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: {
          required: ["userId", "currentCategory", "answers", "scores"],
          received: Object.keys(req.body)
        }
      });
    }

    // Validate category
    if (!categories.includes(currentCategory)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Invalid category",
        validCategories: categories
      });
    }

    // Process and validate answers
    const responses = [];
    let totalScore = 0;
    
    for (const [questionId, answer] of Object.entries(answers)) {
      try {
        const numId = Number(questionId);
        if (isNaN(numId)) throw new Error(`Invalid question ID: ${questionId}`);
        
        if (!answer || typeof answer !== 'object') {
          throw new Error('Answer must be an object');
        }

        const points = Number(answer.points) || 0;
        const selectedOption = String(answer.selectedOption || '');

        responses.push({
          questionId: numId,
          answer: selectedOption,
          points: points
        });

        totalScore += points;
      } catch (error) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: `Invalid answer for question ${questionId}`,
          details: error.message
        });
      }
    }

    // Save progress
    const updatedProgress = await UserProgress.findOneAndUpdate(
      { userId, category: currentCategory },
      {
        userId,
        category: currentCategory,
        responses,
        totalScore,
        completed: true,
        lastUpdated: new Date()
      },
      { 
        upsert: true,
        new: true,
        session
      }
    );

    // Get all progress for completion status
    const allProgress = await UserProgress.find({ userId }).session(session);
    await session.commitTransaction();

    const completionStatus = {};
    const completeScores = {};
    
    categories.forEach(category => {
      const catProgress = allProgress.find(p => p.category === category);
      completionStatus[category] = !!catProgress?.completed;
      completeScores[category] = catProgress?.totalScore || 0;
    });

    const allCategoriesCompleted = categories.every(cat => completionStatus[cat]);

    res.json({
      success: true,
      isAssessmentComplete: allCategoriesCompleted,
      scores: completeScores,
      completedCategories: completionStatus,
      nextCategory: allCategoriesCompleted ? null : 
        categories.find(cat => !completionStatus[cat])
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Save progress error:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({
      success: false,
      error: "Failed to save progress",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
});


// Get user progress with comprehensive data
router.get("/progress/:userId", validateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.find({ userId });

    // Initialize default response
    const response = {
      lastCategoryIndex: 0,
      completedCategories: {},
      answers: {},
      scores: {},
      success: true
    };

    // If no progress exists
    if (!progress || progress.length === 0) {
      return res.json(response);
    }

    // Process progress data
    progress.forEach(item => {
      response.completedCategories[item.category] = item.completed;
      response.scores[item.category] = item.totalScore;
      
      item.responses.forEach(responseItem => {
        response.answers[responseItem.questionId] = {
          selectedOption: responseItem.answer,
          points: responseItem.points
        };
      });
    });

    // Find first incomplete category
    response.lastCategoryIndex = categories.findIndex(
      cat => !response.completedCategories[cat]
    );

    res.json(response);

  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ 
      message: "Error fetching progress", 
      error: error.message,
      success: false 
    });
  }
});


// Reset a single category for a user
router.delete("/reset-category/:userId/:category", validateUser, async (req, res) => {
  try {
      const { userId, category } = req.params;
      
      if (!categories.includes(category)) {
          return res.status(400).json({
              success: false,
              error: "Invalid category",
              validCategories: categories
          });
      }
      
      await UserProgress.deleteOne({ userId, category });
      
      res.json({
          success: true,
          message: "Category reset successfully"
      });
      
  } catch (error) {
      console.error("Category reset error:", error);
      res.status(500).json({
          error: "Failed to reset category",
          details: error.message,
          success: false
      });
  }
});


// Get user scores
router.get("/scores/:userId", validateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const progressDocs = await UserProgress.find({ userId });

    const scores = {};
    categories.forEach(category => {
      const categoryDoc = progressDocs.find(doc => doc.category === category);
      scores[category] = categoryDoc?.totalScore || 0;
    });

    res.json({
      success: true,
      scores,
      isComplete: categories.every(cat => 
        progressDocs.some(doc => doc.category === cat && doc.completed)
      )
    });

  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({
      error: "Failed to fetch scores",
      details: error.message,
      success: false
    });
  }
});

// Reset assessment completely for a user
router.post("/reset-assessment/:userId", validateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    await UserProgress.deleteMany({ userId });
    
    res.json({
      success: true,
      message: "Assessment reset successfully",
      scores: Object.fromEntries(categories.map(cat => [cat, 0])),
      completedCategories: Object.fromEntries(categories.map(cat => [cat, false]))
    });
    
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({
      error: "Failed to reset assessment",
      details: error.message,
      success: false
    });
  }
});

module.exports = router;