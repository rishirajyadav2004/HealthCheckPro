const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"]
  },
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalScore: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
UserProgressSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || 
                 mongoose.model("UserProgress", UserProgressSchema);