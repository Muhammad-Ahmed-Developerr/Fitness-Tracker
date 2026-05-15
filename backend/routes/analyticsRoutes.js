const express = require('express');
const router = express.Router();
const { predictWeight } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

// ELITE ONLY route
router.get('/predict-weight', protect, checkSubscription('ELITE'), predictWeight);

module.exports = router;
