const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Support = require('../models/Support');
const Notification = require('../models/Notification');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeWorkouts = await Workout.countDocuments({});
    const pendingTickets = await Support.countDocuments({ status: 'Pending' });
    
    // Simulate user activity for the chart (In a real app, you'd aggregate this from a logs collection)
    const userActivity = [
      { name: 'Mon', active: await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }) }, // Simplified
      { name: 'Tue', active: Math.floor(Math.random() * 100) + 200 },
      { name: 'Wed', active: Math.floor(Math.random() * 100) + 300 },
      { name: 'Thu', active: Math.floor(Math.random() * 100) + 400 },
      { name: 'Fri', active: Math.floor(Math.random() * 100) + 250 },
      { name: 'Sat', active: Math.floor(Math.random() * 100) + 500 },
      { name: 'Sun', active: Math.floor(Math.random() * 100) + 600 },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeWorkouts,
        pendingTickets,
        growth: '+12%', // Mock growth
        userActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
        return res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      user.role = req.body.role || user.role;
      await user.save();
  
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// @desc    Send notification to all users
// @route   POST /api/admin/notifications/global
// @access  Private/Admin
const sendGlobalNotification = async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const users = await User.find({ role: 'user' });
    
    const notifications = users.map(user => ({
      user: user._id,
      message,
      type: type || 'System'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send notification to specific user
// @route   POST /api/admin/notifications/direct
// @access  Private/Admin
const sendDirectNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'User ID and message are required' });
    }

    const notification = await Notification.create({
      user: userId,
      message,
      type: type || 'System'
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications (for admin log)
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system-wide analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    // 1. Workout Category Distribution
    const workoutDistribution = await Workout.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 2. User Growth (Last 6 months)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', users: 1, _id: 0 } }
    ]);

    // 3. Nutrition Averages
    const macros = await Nutrition.aggregate([
      {
        $group: {
          _id: null,
          avgProtein: { $avg: '$protein' },
          avgCarbs: { $avg: '$carbs' },
          avgFats: { $avg: '$fats' }
        }
      }
    ]);

    // 4. Activity Pulse (Events per day for last 7 days)
    const activityPulse = await Workout.aggregate([
      {
        $match: {
          date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { day: '$_id', sessions: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        workoutDistribution,
        userGrowth,
        avgMacros: macros[0] || { avgProtein: 0, avgCarbs: 0, avgFats: 0 },
        activityPulse
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all support tickets
// @route   GET /api/admin/support
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Support.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Support.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = req.body.status || ticket.status;
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
