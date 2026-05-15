const cron = require('node-cron');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Habit = require('../models/Habit');
const sendEmail = require('../utils/emailService');

/**
 * Background worker to send retention reminders.
 */
const initReminderWorker = () => {
  // Run daily at 8 PM (20:00)
  cron.schedule('0 20 * * *', async () => {
    console.log('Running daily reminder audit...');
    
    try {
      const users = await User.find({ isVerified: true });
      const today = new Date();
      today.setHours(0,0,0,0);

      for (const user of users) {
        // 1. Check Workout
        const workoutToday = await Workout.findOne({ user: user._id, date: { $gte: today } });
        
        if (!workoutToday) {
          await sendEmail({
            email: user.email,
            subject: 'FitForge AI - Don\'t miss your workout!',
            message: `Hi ${user.name}, we noticed you haven't logged a workout today. Consistency is key!`,
            html: `<h1>Time to sweat!</h1><p>Hi ${user.name}, keep your streak alive by logging a workout today.</p>`
          });
        }

        // 2. Check Habits (Water)
        const waterToday = await Habit.findOne({ user: user._id, type: 'Water', date: today });
        if (!waterToday || waterToday.currentValue < waterToday.target) {
            await sendEmail({
                email: user.email,
                subject: 'FitForge AI - Stay Hydrated!',
                message: `Hi ${user.name}, you haven't reached your water goal for today. Drink up!`,
                html: `<p>Don't forget to hydrate, ${user.name}!</p>`
            });
        }
      }
      console.log('Reminder audit completed successfuly.');
    } catch (error) {
      console.error('Reminder worker error:', error);
    }
  });
};

module.exports = { initReminderWorker };
