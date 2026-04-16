const express = require('express');
const router = express.Router();
const { exportToPDF, exportToCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/pdf', protect, exportToPDF);
router.get('/csv', protect, exportToCSV);

module.exports = router;
