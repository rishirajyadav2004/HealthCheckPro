const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const UserProgress = require("../models/UserProgress");
const auth = require("../middleware/auth")
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


// In your backend routes
router.get('/scores', auth, async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.user.id });
    const scores = {};
    
    categories.forEach(category => {
      const categoryProgress = progress.find(p => p.category === category);
      scores[category] = categoryProgress?.totalScore || 0;
    });

    res.json({ scores });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

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


router.post("/save-progress", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
      const { currentCategory, answers } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!currentCategory || !answers) {
          await session.abortTransaction();
          return res.status(400).json({
              success: false,
              error: "Missing required fields",
              details: {
                  required: ["currentCategory", "answers"],
                  received: Object.keys(req.body)
              }
          });
      }

      // Process answers and calculate score
      const responses = [];
      let totalScore = 0;

      for (const [questionId, answer] of Object.entries(answers)) {
          responses.push({
              questionId: Number(questionId),
              answer: answer.selectedOption,
              points: answer.points
          });
          totalScore += answer.points;
      }

      // Update progress
      const updatedProgress = await UserProgress.findOneAndUpdate(
          { userId, category: currentCategory },
          {
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

      // Get completion status
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
router.get("/progress", auth, async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.user.id });

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

// In your assessmentRoutes.js
router.post("/reset-assessment", auth, async (req, res) => {
  try {
      // Delete all progress for this user
      await UserProgress.deleteMany({ userId: req.user.id });
      
      // Initialize fresh progress records
      const initializationPromises = categories.map(category => 
          UserProgress.create({
              userId: req.user.id,
              category,
              responses: [],
              totalScore: 0,
              completed: false
          })
      );

      await Promise.all(initializationPromises);
      
      res.json({ 
          success: true, 
          message: "Assessment reset successfully",
          scores: Object.fromEntries(categories.map(cat => [cat, 0])) // Remove this extra parenthesis
      });
  } catch (error) {
      console.error("Reset error:", error);
      res.status(500).json({ 
          success: false,
          error: "Failed to reset assessment",
          details: error.message 
      });
  }
});


// Add this new route
router.post("/initialize", auth, async (req, res) => {
  try {
    // Check if user already has any progress
    const existingProgress = await UserProgress.findOne({ userId: req.user.id });
    if (existingProgress) {
      return res.status(200).json({ message: "User already has assessment data" });
    }

    // Initialize empty progress for all categories
    const initializationPromises = categories.map(category => 
      UserProgress.create({
        userId: req.user.id,
        category,
        responses: [],
        totalScore: 0,
        completed: false
      })
    );

    await Promise.all(initializationPromises);
    res.json({ success: true, message: "Assessment initialized" });
  } catch (error) {
    res.status(500).json({ error: "Initialization failed" });
  }
});


// Add this route to assessmentRoutes.js
router.get("/current-progress", auth, async (req, res) => {
  try {
      const progress = await UserProgress.find({ userId: req.user.id });
      
      // Initialize response
      const response = {
          completedCategories: {},
          scores: {},
          nextCategoryIndex: 0,
          answers: {}
      };

      // Populate completed categories and scores
      progress.forEach(item => {
          response.completedCategories[item.category] = item.completed;
          response.scores[item.category] = item.totalScore;
          
          // Store answers
          item.responses.forEach(resp => {
              response.answers[resp.questionId] = {
                  selectedOption: resp.answer,
                  points: resp.points
              };
          });
      });

      // Find first incomplete category
      const categories = ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"];
      response.nextCategoryIndex = categories.findIndex(
          cat => !response.completedCategories[cat]
      );

      // If all completed, nextCategoryIndex will be -1
      if (response.nextCategoryIndex === -1) {
          response.nextCategoryIndex = 0; // Start from beginning if all completed
      }

      res.json({
          success: true,
          data: response
      });
  } catch (error) {
      console.error("Error fetching current progress:", error);
      res.status(500).json({
          success: false,
          error: "Failed to fetch current progress"
      });
  }
});


module.exports = router;