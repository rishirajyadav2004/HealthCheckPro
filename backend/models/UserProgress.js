// models/UserProgress.js
const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed to accept both
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ["PhysicalFitness", "Nutrition", "MentalWellBeing", "Lifestyle", "Biomarkers"],
    required: true
  },
  responses: [{
    questionId: { type: Number, required: true },
    answer: { type: String, required: true },
    points: { type: Number, required: true }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.models.UserProgress || 
                 mongoose.model("UserProgress", UserProgressSchema);