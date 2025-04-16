const mongoose = require('mongoose');

const AssessmentHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  scores: {
    PhysicalFitness: Number,
    Nutrition: Number,
    MentalWellBeing: Number,
    Lifestyle: Number,
    Biomarkers: Number,
    Overall: Number
  },
  responses: [{
    questionId: String,
    selectedOption: String,
    points: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('AssessmentHistory', AssessmentHistorySchema);