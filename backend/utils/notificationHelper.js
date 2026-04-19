const Notification = require('../models/Notification');

const createNotification = async (userId, message, type = 'System') => {
  try {
    await Notification.create({
      user: userId,
      message,
      type
    });
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};

module.exports = { createNotification };
