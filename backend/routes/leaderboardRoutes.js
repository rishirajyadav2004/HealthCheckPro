const express = require('express');
const router = express.Router();
const AssessmentHistory = require('../models/AssessmentHistory');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Get overall leaderboard
router.get('/overall', authMiddleware, async (req, res) => {
  try {
    // Get all users' latest assessments with all category scores
    const allAssessments = await AssessmentHistory.aggregate([
      { $sort: { completedAt: -1 } },
      { 
        $group: { 
          _id: "$userId", 
          latestScores: { $first: "$scores" },
          latestDate: { $first: "$completedAt" }
        }
      },
      { 
        $lookup: { 
          from: "users", 
          localField: "_id", 
          foreignField: "_id", 
          as: "user" 
        }
      },
      { $unwind: "$user" },
      { 
        $project: { 
          userId: "$_id",
          name: "$user.name",
          // Calculate overall score as average of all categories scaled to 100
          score: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $add: [
                          "$latestScores.PhysicalFitness",
                          "$latestScores.Nutrition",
                          "$latestScores.MentalWellBeing",
                          "$latestScores.Lifestyle",
                          "$latestScores.Biomarkers"
                        ]
                      },
                      5
                    ]
                  },
                  4
                ]
              }
            ]
          },
          isCurrentUser: { 
            $eq: ["$_id", new mongoose.Types.ObjectId(req.user.id)] 
          }
        }
        
      },
      { $sort: { score: -1 } }
    ]);

    res.json(allAssessments);
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category leaderboard
router.get('/category/:category', authMiddleware, async (req, res) => {
  try {
    const category = req.params.category;
    const validCategories = ['PhysicalFitness', 'Nutrition', 'MentalWellBeing', 'Lifestyle', 'Biomarkers'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Get all users' latest assessments for this category
    const allAssessments = await AssessmentHistory.aggregate([
      { $sort: { completedAt: -1 } },
      { 
        $group: { 
          _id: "$userId", 
          latestScore: { $first: `$scores.${category}` },
          latestDate: { $first: "$completedAt" }
        }
      },
      { 
        $lookup: { 
          from: "users", 
          localField: "_id", 
          foreignField: "_id", 
          as: "user" 
        }
      },
      { $unwind: "$user" },
      { 
        $project: { 
          userId: "$_id",
          name: "$user.name",
          score: "$latestScore",
          isCurrentUser: { 
            $eq: ["$_id", new mongoose.Types.ObjectId(req.user.id)] 
          }
        }
      },
      { $sort: { score: -1 } }
    ]);

    res.json(allAssessments);
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;