const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number,
  },
  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: Number, required: true },
      reps: { type: Number, required: true },
      weight: { type: Number, required: true },
    }
  ],
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Flexibility', 'Other', 'HIIT'],
    default: 'Strength',
  },
  muscleGroup: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  notes: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
