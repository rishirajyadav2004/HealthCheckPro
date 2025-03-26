const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Adjust path if needed

// Get User Data by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });

        console.log("User found:", user);  // 🔍 Debug log
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
