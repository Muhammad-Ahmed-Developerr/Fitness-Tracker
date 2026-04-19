const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');

/**
 * Service to handle complex fitness and health data aggregations.
 */
class AnalyticsService {
  /**
   * Generates a workout heatmap (frequency per date)
   */
  async getWorkoutHeatmap(userId, startDate, endDate) {
    return await Workout.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Generates muscle group distribution
   */
  async getMuscleGroupDistribution(userId, startDate, endDate) {
    return await Workout.aggregate([
      { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$muscleGroup",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Tracks strength progression for a specific exercise
   */
  async getStrengthProgression(userId, exerciseName) {
    return await Workout.aggregate([
      { $match: { user: userId, 'exercises.name': { $regex: new RegExp(exerciseName, 'i') } } },
      { $unwind: "$exercises" },
      { $match: { 'exercises.name': { $regex: new RegExp(exerciseName, 'i') } } },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          maxWeight: { $max: "$exercises.sets.weight" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Calculates correlation between Calories and Weight
   */
  async getCalorieWeightCorrelation(userId, limit = 30) {
    const nutrition = await Nutrition.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          calories: { $sum: "$calories" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limit }
    ]);

    const progress = await Progress.find({ user: userId })
      .sort({ date: -1 })
      .limit(limit)
      .select('weight date');

    // Merge by date
    return nutrition.map(n => {
      const p = progress.find(pg => pg.date.toISOString().split('T')[0] === n._id);
      return {
        date: n._id,
        calories: n.calories,
        weight: p ? p.weight : null
      };
    }).filter(item => item.weight !== null);
  }

  /**
   * Insight Engine: Generates actionable advice based on trends
   */
  async generateInsights(userId) {
    const insights = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Protein Insight
    const recentNutrition = await Nutrition.aggregate([
        { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, avgProtein: { $avg: "$protein" } } }
    ]);
    if (recentNutrition[0] && recentNutrition[0].avgProtein < 100) {
        insights.push("Your average protein intake is below 100g. Aim for higher to preserve muscle mass.");
    }

    // 2. Consistency Insight
    const workoutCount = await Workout.countDocuments({ user: userId, date: { $gte: sevenDaysAgo } });
    if (workoutCount < 3) {
        insights.push("You've individual workout logged only " + workoutCount + " times this week. Try to hit at least 3 for results!");
    }

    return insights;
  }
}

module.exports = new AnalyticsService();
