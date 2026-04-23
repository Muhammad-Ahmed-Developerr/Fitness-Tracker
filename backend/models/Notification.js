const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null means System
  message: { type: String, required: true },
  type: { type: String, enum: ['Workout', 'Goal', 'Reminder', 'System', 'Nutrition', 'Progress', 'Profile', 'Support'], default: 'System' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
