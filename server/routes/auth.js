// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword, 
  resetPassword, 
  showPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/reset-password', resetPassword);
router.get('/show-password', protect, showPassword);

module.exports = router;