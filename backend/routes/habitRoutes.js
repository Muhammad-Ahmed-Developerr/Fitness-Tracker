const express = require('express');
const router = express.Router();
const { getHabits, updateHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getHabits)
    .post(updateHabit);

module.exports = router;
