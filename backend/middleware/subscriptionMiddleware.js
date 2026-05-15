/**
 * Middleware to restrict access based on subscription tiers.
 * Hierarchy: FREE < PRO < ELITE
 */
const checkSubscription = (requiredPlan) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { plan = 'FREE', currentPeriodEnd } = req.user.subscription || {};

    // 1. Check for expiration
    const now = new Date();
    if (plan !== 'FREE' && currentPeriodEnd && new Date(currentPeriodEnd) < now) {
      console.log(`📉 Downgrading user ${req.user.email} due to expired subscription.`);
      req.user.subscription.plan = 'FREE';
      req.user.subscription.status = 'inactive';
      await req.user.save();
      
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please upgrade to continue using this feature.',
        downgraded: true
      });
    }

    // 2. Plan Hierarchy Check
    const tiers = { 'FREE': 0, 'PRO': 1, 'ELITE': 2 };
    const userTier = tiers[plan] || 0;
    const requiredTier = tiers[requiredPlan] || 0;

    if (userTier < requiredTier) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a ${requiredPlan} plan. Your current plan is ${plan}.`
      });
    }

    next();
  };
};

module.exports = { checkSubscription };
