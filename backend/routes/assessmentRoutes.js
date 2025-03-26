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

// GET questions by category
router.get("/questions/:category", async (req, res) => {
  try {
    const { category } = req.params;
    if (!questions[category]) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(questions[category]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

// Save progress with improved retake handling
router.post("/save-progress", async (req, res) => {
  try {
    const { userId, currentCategory, answers, scores } = req.body;

    if (!userId || !currentCategory || !answers || !scores) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          required: ["userId", "currentCategory", "answers", "scores"],
          received: Object.keys(req.body)
        }
      });
    }

    // Calculate total score for current category
    const responses = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer: answer.selectedOption,
      points: answer.points || 0
    }));

    const totalScore = responses.reduce((sum, r) => sum + r.points, 0);

    // Upsert the progress for this category
    await UserProgress.findOneAndUpdate(
      { userId, category: currentCategory },
      {
        userId,
        category: currentCategory,
        responses,
        totalScore,
        completed: true,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Get all progress to determine next steps
    const allProgress = await UserProgress.find({ userId });
    
    // Check if all categories are completed
    const allCategoriesCompleted = categories.every(category => 
      allProgress.some(p => p.category === category && p.completed)
    );

    // Build complete scores object
    const completeScores = {};
    categories.forEach(category => {
      const catProgress = allProgress.find(p => p.category === category);
      completeScores[category] = catProgress ? catProgress.totalScore : 0;
    });

    res.json({
      success: true,
      isAssessmentComplete: allCategoriesCompleted,
      scores: completeScores,
      nextCategory: allCategoriesCompleted ? null : 
        categories.find(cat => !allProgress.some(p => p.category === cat && p.completed))
    });

  } catch (error) {
    console.error("Database save error:", error);
    res.status(500).json({
      error: "Failed to save progress",
      details: error.message
    });
  }
});

// Reset assessment completely for a user
router.post("/reset-assessment/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    await UserProgress.deleteMany({ userId });
    
    res.json({
      success: true,
      message: "Assessment reset successfully",
      scores: Object.fromEntries(categories.map(cat => [cat, 0]))
    });
    
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({
      error: "Failed to reset assessment",
      details: error.message
    });
  }
});

// Get user progress
router.get("/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.find({ userId });

    if (!progress || progress.length === 0) {
      return res.json({
        lastCategoryIndex: 0,
        completedCategories: {},
        answers: {},
        scores: {}
      });
    }

    // Build response
    const completedCategories = {};
    const answers = {};
    const scores = {};

    progress.forEach(item => {
      completedCategories[item.category] = item.completed;
      scores[item.category] = item.totalScore;
      
      item.responses.forEach(response => {
        answers[response.questionId] = {
          selectedOption: response.answer,
          points: response.points
        };
      });
    });

    // Find the first incomplete category
    const firstIncompleteIndex = categories.findIndex(
      cat => !completedCategories[cat]
    );

    res.json({
      lastCategoryIndex: firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0,
      completedCategories,
      answers,
      scores
    });

  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress", error });
  }
});

// Get user scores
router.get("/scores/:userId", async (req, res) => {
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
      scores
    });

  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({
      error: "Failed to fetch scores",
      details: error.message
    });
  }
});

module.exports = router;