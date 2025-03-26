const mongoose = require("mongoose");
const UserProgress = require("../models/UserProgress");

exports.saveProgress = async (req, res) => {
    try {
        console.log("🔹 Received request:", req.body);
        const { userId, category, currentQuestionIndex, selectedOption, points } = req.body;

        if (!userId || !category || currentQuestionIndex === undefined || !selectedOption) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        let progress = await UserProgress.findOne({ userId: userObjectId, category });

        if (!progress) {
            progress = new UserProgress({
                userId: userObjectId,
                category,
                responses: [],
                totalScore: 0,
                completed: false,
            });
        }

        progress.responses.push({
            questionId: currentQuestionIndex,
            answer: selectedOption,
            points: points || 0,
        });

        progress.totalScore += points || 0;
        if (progress.responses.length === 5) {
            progress.completed = true;
        }

        await progress.save();
        console.log("✅ Progress saved successfully:", progress);
        res.json({ message: "Progress saved successfully", progress });
    } catch (error) {
        console.error("❌ Error saving progress:", error);
        res.status(500).json({ message: "Error saving progress", error });
    }
};

exports.getScores = async (req, res) => {
  try {
    res.status(200).json({ message: "Scores fetched successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
