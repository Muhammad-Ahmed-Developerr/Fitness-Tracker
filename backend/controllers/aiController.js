const AIPlan = require('../models/AIPlan');
const aiService = require('../services/aiService');
const crypto = require('crypto');

/**
 * Helper to generate a hash from user profile data.
 */
const generateProfileHash = (data) => {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
};

// @desc    Generate or retrieve AI Fitness Plan
// @route   POST /api/ai/generate
// @access  Private (PRO/ELITE)
const generatePlan = async (req, res, next) => {
  try {
    const { profileData } = req.user;

    if (!profileData || !profileData.age || !profileData.weight) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your fitness profile before generating a plan.' 
      });
    }

    const currentHash = generateProfileHash(profileData);

    // Check for cached plan with the same profile data
    const cachedPlan = await AIPlan.findOne({ 
      user: req.user._id, 
      userInputHash: currentHash 
    }).sort({ createdAt: -1 });

    if (cachedPlan) {
      return res.status(200).json({
        success: true,
        data: cachedPlan.generatedPlan,
        cached: true
      });
    }

    // Generate new plan if no match or data changed
    const newPlanData = await aiService.generateFitnessPlan(profileData);

    const savedPlan = await AIPlan.create({
      user: req.user._id,
      generatedPlan: newPlanData,
      userInputHash: currentHash
    });

    res.status(201).json({
      success: true,
      data: savedPlan.generatedPlan,
      cached: false
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get latest AI Fitness Plan
// @route   GET /api/ai/plan
// @access  Private (PRO/ELITE)
const getLatestPlan = async (req, res, next) => {
  try {
    const plan = await AIPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'No AI plan found. Please generate one.' });
    }

    res.status(200).json({ success: true, data: plan.generatedPlan });
  } catch (error) {
    next(error);
  }
};

module.exports = { generatePlan, getLatestPlan };
