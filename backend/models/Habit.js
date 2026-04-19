const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Steps', 'Water', 'Sleep'],
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Ensure unique habit-per-day-per-user-per-type
habitSchema.index({ user: 1, type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Habit', habitSchema);
