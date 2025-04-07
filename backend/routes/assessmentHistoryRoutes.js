// backend/routes/assessmentHistory.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AssessmentHistory = require('../models/AssessmentHistory');

router.get('/testdb', auth, async (req, res) => {
  try {
    const items = await AssessmentHistory.find().limit(1);
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'DB Error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const histories = await AssessmentHistory.find({ user: req.user.id });
    res.json(histories);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Test route without auth
router.get('/test', (req, res) => {
  res.send("Test route works!");
});



// Protected route with simple auth
router.get('/protected', auth, (req, res) => {
  res.send("Protected route works!");
});

module.exports = router;