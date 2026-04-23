const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import modular admin controllers
const { getAdminStats, getAuditLogs } = require('../controllers/admin/statsController');
const { getAllUsers, deleteUser, updateUserRole, updateUser } = require('../controllers/admin/userController');
const { getAnalytics } = require('../controllers/admin/analyticsController');
const { getAllTickets, updateTicketStatus } = require('../controllers/admin/supportController');
const { 
    sendGlobalNotification, 
    sendDirectNotification, 
    getAllNotifications 
} = require('../controllers/admin/notificationController');

// All routes here require being logged in and being an admin
router.use(protect);
router.use(admin);

// Dashboard & Logs
router.get('/stats', getAdminStats);
router.get('/logs', getAuditLogs);

// User Management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id', updateUser);

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
