const express = require('express');
const router = express.Router();
const AssessmentHistory = require('../models/AssessmentHistory');
const auth = require('../middleware/auth');

// Save assessment history
router.post('/', auth, async (req, res) => {
    try {
        const { scores, responses } = req.body;
        
        const newHistory = new AssessmentHistory({
            userId: req.user.id,
            scores,
            responses
        });

        await newHistory.save();
        
        res.status(201).json({ success: true, message: "Assessment history saved" });
    } catch (error) {
        console.error("Error saving assessment history:", error);
        res.status(500).json({ success: false, error: "Failed to save assessment history" });
    }
});

// Get user's assessment history
router.get('/', auth, async (req, res) => {
    try {
        const histories = await AssessmentHistory.find({ userId: req.user.id })
            .sort({ completedAt: -1 });
            
        res.json(histories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assessment history" });
    }
});

module.exports = router;