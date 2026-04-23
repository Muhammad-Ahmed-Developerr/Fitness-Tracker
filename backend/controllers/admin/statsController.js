const User = require('../../models/User');
const Workout = require('../../models/Workout');
const Support = require('../../models/Support');
const AuditLog = require('../../models/AuditLog');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeWorkouts = await Workout.countDocuments({});
    const pendingTickets = await Support.countDocuments({ status: 'Pending' });
    
    // Plans Distribution
    const freeUsers = await User.countDocuments({ 'subscription.plan': 'FREE', role: 'user' });
    const proUsers = await User.countDocuments({ 'subscription.plan': 'PRO', role: 'user' });
    const eliteUsers = await User.countDocuments({ 'subscription.plan': 'ELITE', role: 'user' });

    // Calculate Estimated Revenue
    const proPrice = 19.99;
    const elitePrice = 39.99;
    const estimatedRevenue = (proUsers * proPrice) + (eliteUsers * elitePrice);

    // Simulate user activity for the chart
    const userActivity = [
      { name: 'Mon', active: 400 + Math.floor(Math.random() * 100) },
      { name: 'Tue', active: 300 + Math.floor(Math.random() * 150) },
      { name: 'Wed', active: 600 + Math.floor(Math.random() * 200) },
      { name: 'Thu', active: 800 + Math.floor(Math.random() * 100) },
      { name: 'Fri', active: 500 + Math.floor(Math.random() * 150) },
      { name: 'Sat', active: 900 + Math.floor(Math.random() * 100) },
      { name: 'Sun', active: 1000 + Math.floor(Math.random() * 200) },
    ];

    // Fetch Recent Audit Logs
    const systemLogs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeWorkouts,
        pendingTickets,
        growth: '+15.2%', 
        subscriptionGrowth: '+12.4%',
        monthlyRevenue: `$${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        aiRequestsToday: 142 + Math.floor(Math.random() * 50),
        plansDistribution: {
          FREE: freeUsers,
          PRO: proUsers,
          ELITE: eliteUsers
        },
        userActivity,
        systemLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAuditLogs
};
