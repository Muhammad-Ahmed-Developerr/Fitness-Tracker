/**
 * Middleware to restrict access to premium (PRO/ELITE) features.
 * @param {Array} allowedPlans - Array of plans that can access this route.
 */
const restrictTo = (...allowedPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { plan } = req.user.subscription;

    if (!allowedPlans.includes(plan)) {
      return res.status(403).json({
        success: false,
        message: `Plan upgrade required. This feature is only available for: ${allowedPlans.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { restrictTo };
