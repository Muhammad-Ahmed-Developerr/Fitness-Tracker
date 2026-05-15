const analyticsService = require('../services/analyticsService');
const cacheService = require('../services/cacheService');

// @desc    Predict future weight (7 days)
// @route   GET /api/analytics/predict-weight
// @access  Private (ELITE ONLY)
const predictWeight = async (req, res, next) => {
  try {
    const cacheKey = `analytics:predict:${req.user._id}:${new Date().toISOString().split('T')[0]}`;
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    const result = await analyticsService.predictFutureWeight(req.user._id);
    
    if (!result.success) {
      return res.status(200).json({
        success: false,
        message: result.message,
        data: null
      });
    }

    // Cache for 12 hours
    cacheService.set(cacheKey, result, 720);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { predictWeight };
