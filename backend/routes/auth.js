const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateMe,
  verifyOTP
} = require('../controllers/auth.controller');
const { protect, authLimiter } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword,
  validateVerifyOTP 
} = require('../middleware/validation');

// Apply rate limiting to authentication routes
router.use(authLimiter);

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes - require authentication
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', changePassword);
router.patch('/update-me', updateMe);

// Admin only routes
// router.use(authorize('admin'));
// Add admin-specific routes here

module.exports = router;
