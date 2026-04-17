const express = require('express');
const router = express.Router();
const { 
    getAdminStats, 
    getAllUsers, 
    deleteUser, 
    updateUserRole,
    sendGlobalNotification,
    sendDirectNotification,
    getAllNotifications,
    getAnalytics,
    getAllTickets,
    updateTicketStatus
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here require being logged in and being an admin
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Analytics
router.get('/analytics', getAnalytics);

// Support
router.get('/support', getAllTickets);
router.put('/support/:id', updateTicketStatus);

// Notifications
router.get('/notifications', getAllNotifications);
router.post('/notifications/global', sendGlobalNotification);
router.post('/notifications/direct', sendDirectNotification);

module.exports = router;
