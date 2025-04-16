const express = require('express');
const router = express.Router();
const Profile = require('../models/ProfileModel');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Update user profile
router.put('/:userId', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, gender, age, bloodGroup } = req.body;
    const updateData = { name, email, phone, gender, age, bloodGroup };

    if (req.file) {
      updateData.photo = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;