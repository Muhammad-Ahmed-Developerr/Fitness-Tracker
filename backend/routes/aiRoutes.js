const express = require('express');
const router = express.Router();
const { generatePlan, getLatestPlan } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/premiumMiddleware');

// All AI Coach routes are protected and require a PRO or ELITE plan
router.post('/generate', protect, restrictTo('PRO', 'ELITE'), generatePlan);
router.get('/plan', protect, restrictTo('PRO', 'ELITE'), getLatestPlan);

module.exports = router;
