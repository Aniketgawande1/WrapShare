// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('No token provided in request headers');
      return res.status(401).json({ message: 'Not authorized - No token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully for user:', decoded.userId);
    
    // Get user from the token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for decoded token:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token format' });
    } else {
      res.status(401).json({ message: 'Not authorized - Invalid token' });
    }
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};