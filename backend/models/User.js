const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Not required for Google OAuth users
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  fitnessGoals: {
    type: String,
    default: '',
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    units: { type: String, enum: ['kg', 'lbs'], default: 'lbs' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
