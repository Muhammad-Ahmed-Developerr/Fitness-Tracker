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
  },
  subscription: {
    plan: { type: String, enum: ['FREE', 'PRO', 'ELITE'], default: 'FREE' },
    status: { type: String, default: 'inactive' },
    stripeSubscriptionId: { type: String },
    currentPeriodEnd: { type: Date }
  },
  profileData: {
    age: { type: Number },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    activityLevel: { type: String, enum: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] },
    goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance'] },
    dietPreference: { type: String, enum: ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo'] }
  },
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 }
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
