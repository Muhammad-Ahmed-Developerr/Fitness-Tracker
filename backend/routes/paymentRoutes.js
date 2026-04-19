const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Webhook must be public and use express.raw() - handled in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected payment routes
router.post('/create-checkout', protect, createCheckoutSession);

module.exports = router;
