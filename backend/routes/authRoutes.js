const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleOAuthLogin
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/google', googleOAuthLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Scaffold for Google OAuth
router.post('/google', googleOAuthLogin);

module.exports = router;
