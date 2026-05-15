const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, getSubscriptionDetails, verifySession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Webhook must be public and use express.raw() - handled in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected payment routes
router.post('/create-checkout', protect, createCheckoutSession);
router.get('/subscription', protect, getSubscriptionDetails);
router.post('/verify-session', protect, verifySession);

module.exports = router;

