// middleware/validationMiddleware.js
const mongoose = require('mongoose');

const validateUser = (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false,
      error: 'User ID is required' 
    });
  }

  // Uncomment if you're using MongoDB ObjectIds
  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({
  //     success: false,
  //     error: 'Invalid user ID format'
  //   });
  // }

  next();
};

module.exports = { validateUser };