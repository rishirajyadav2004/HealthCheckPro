// // backend/middleware/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = function(req, res, next) {
//   try {
//     const token = req.header('x-auth-token');
//     if (!token) return res.status(401).json({ msg: 'No token' });
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Invalid token' });
//   }
// };

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

module.exports = auth;