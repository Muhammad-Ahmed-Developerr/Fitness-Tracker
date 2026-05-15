const getStripe = require('../config/stripe');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const stripeService = require('../services/stripeService');
const { logEvent } = require('../services/logService');

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/payments/create-checkout
 * @access  Private
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.error('❌ Payment Error: Stripe is not initialized. Check STRIPE_SECRET_KEY in .env');
      return res.status(500).json({ success: false, message: 'Stripe configuration error. Please contact support.' });
    }

    const { planType } = req.body; // e.g., 'PRO' or 'ELITE'
    console.log(`💳 Initiating checkout for plan: ${planType} (User: ${req.user.email})`);
    
    // Map plans to Stripe Price IDs
    const priceIds = {
      PRO: process.env.STRIPE_PRO_PRICE_ID,
      ELITE: process.env.STRIPE_ELITE_PRICE_ID
    };

    if (!priceIds[planType]) {
      console.warn(`⚠️ Payment Warning: Invalid plan type requested: ${planType}`);
      return res.status(400).json({ success: false, message: 'Invalid plan type selected.' });
    }

    const session = await stripeService.createCheckoutSession(
      req.user._id,
      req.user.email,
      priceIds[planType]
    );

    console.log(`✅ Checkout session created: ${session.id}`);
    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('❌ Checkout Controller Error:', error.message);
    next(error);
  }
};

/**
 * @desc    Get current user's subscription details
 * @route   GET /api/payments/subscription
 * @access  Private
 */
const getSubscriptionDetails = async (req, res, next) => {
  try {
    const user = req.user;
    const subscriptionRecord = await Subscription.findOne({ user: user._id }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        currentPlan: user.subscription?.plan || 'FREE',
        status: user.subscription?.status || 'inactive',
        currentPeriodEnd: user.subscription?.currentPeriodEnd,
        aiUsageCount: user.subscription?.aiUsageCount || 0,
        lastAiReset: user.subscription?.lastAiReset,
        history: subscriptionRecord?.history || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Stripe Webhooks
 * @route   POST /api/payments/webhook
 * @access  Public
*/
const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await updateUserSubscription(session.metadata.userId, session.subscription);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await syncSubscriptionStatus(subscription);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      await handlePaymentFailed(failedInvoice);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Helper to update user plan after checkout
 */
async function updateUserSubscription(userId, subscriptionId) {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Detection based on Price ID env variables
    const priceId = subscription.items.data[0].price.id;
    let planType = 'FREE';
    
    if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
      planType = 'ELITE';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'PRO';
    }

    console.log(`📌 Updating User ${userId} to ${planType} plan.`);

    // 1. Update the User's live subscription cache
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': planType,
      'subscription.status': 'active',
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.aiUsageCount': 0 // Reset usage on upgrade
    });

    // 2. Update/Create the Subscription tracking record
    let subRecord = await Subscription.findOne({ user: userId });
    if (!subRecord) {
      subRecord = new Subscription({ user: userId });
    }

    const previousPlan = subRecord.plan || 'FREE';
    const tiers = { 'FREE': 0, 'PRO': 1, 'ELITE': 2 };
    const reason = tiers[planType] > tiers[previousPlan] ? 'upgrade' : 
                   tiers[planType] < tiers[previousPlan] ? 'downgrade' : 'renewal';

    subRecord.recordPlanChange({
      plan: planType,
      status: 'active',
      reason,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      periodStart: new Date(subscription.current_period_start * 1000),
      periodEnd: new Date(subscription.current_period_end * 1000)
    });

    await subRecord.save();

    // 3. Log the event
    await logEvent({
      event: 'SUBSCRIPTION_UPDATED',
      message: `User ${userId} ${reason}d to ${planType} plan`,
      category: 'BILLING',
      user: userId
    });

    console.log(`✅ Subscription record synced for user ${userId}: ${planType} (${reason})`);
  } catch (error) {
    console.error('❌ Update User Sub Error:', error.message);
  }
}

/**
 * Helper to sync subscription status (cancelations/expirations)
 */
async function syncSubscriptionStatus(subscription) {
  const status = subscription.status;
  const isExpired = ['canceled', 'incomplete_expired', 'past_due', 'unpaid'].includes(status);
  
  const updateData = {
    'subscription.status': status,
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
  };

  // If subscription is definitely over, downgrade to FREE
  if (isExpired || status === 'canceled') {
    updateData['subscription.plan'] = 'FREE';
    updateData['subscription.status'] = 'inactive';
  }

  const userId = subscription.metadata?.userId;
  let user;

  if (userId) {
    user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  } else {
    user = await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': subscription.id },
        updateData,
        { new: true }
    );
  }

  // Sync to Subscription tracking model
  if (user) {
    try {
      let subRecord = await Subscription.findOne({ user: user._id });
      if (subRecord) {
        const reason = isExpired ? 'expiration' : (status === 'canceled' ? 'cancellation' : 'renewal');
        subRecord.recordPlanChange({
          plan: isExpired ? 'FREE' : subRecord.plan,
          status: isExpired ? 'inactive' : status,
          reason,
          periodEnd: new Date(subscription.current_period_end * 1000)
        });
        await subRecord.save();
      }
    } catch (err) {
      console.error('❌ Subscription record sync error:', err.message);
    }
  }
}

/**
 * Helper to handle failed payments
 */
async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const user = await User.findOneAndUpdate(
      { 'subscription.stripeSubscriptionId': subscriptionId },
      { 'subscription.status': 'past_due' },
      { new: true }
    );

    if (user) {
      let subRecord = await Subscription.findOne({ user: user._id });
      if (subRecord) {
        subRecord.recordPlanChange({
          plan: subRecord.plan,
          status: 'past_due',
          reason: 'payment_failed'
        });
        await subRecord.save();
      }

      await logEvent({
        event: 'PAYMENT_FAILED',
        message: `Payment failed for user ${user.email}`,
        category: 'BILLING',
        user: user._id
      });
    }
  } catch (error) {
    console.error('❌ Payment failed handler error:', error.message);
  }
}

/**
 * @desc    Verify checkout session and activate subscription
 * @route   POST /api/payments/verify-session
 * @access  Private
 *
 * IMPORTANT: Determines the purchased plan from the Stripe session FIRST,
 * then only skips processing if the user is already on that tier or higher.
 * This fixes the PRO → ELITE upgrade mismatch bug.
 */
const verifySession = async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe not configured.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    console.log(`🔍 Verifying checkout session: ${sessionId}`);

    // Retrieve the checkout session with line_items expanded
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription']
    });

    console.log(`📋 Session status: ${session.status}, payment_status: ${session.payment_status}`);

    // For subscriptions, check that the session is complete
    if (session.status !== 'complete' && session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Checkout session is not complete yet.' });
    }

    // Verify the session belongs to this user
    const userId = session.metadata?.userId;
    if (!userId || userId !== req.user._id.toString()) {
      console.warn(`⚠️ Session userId mismatch: session=${userId}, user=${req.user._id}`);
      return res.status(403).json({ success: false, message: 'Session does not belong to this user.' });
    }

    // ─── STEP 1: Determine the purchased plan FIRST ─────────────────────────
    let priceId = null;
    let subscriptionId = null;
    let periodStart = null;
    let periodEnd = null;

    // Try to get price from expanded line_items
    if (session.line_items?.data?.length > 0) {
      priceId = session.line_items.data[0].price?.id;
    }

    // Get subscription details
    if (session.subscription) {
      const subId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;
      
      const sub = await stripe.subscriptions.retrieve(subId);

      subscriptionId = sub.id;
      
      // Safely extract period dates with fallbacks
      if (sub.current_period_start && !isNaN(sub.current_period_start)) {
        periodStart = new Date(sub.current_period_start * 1000);
      } else {
        periodStart = new Date();
      }
      
      if (sub.current_period_end && !isNaN(sub.current_period_end)) {
        periodEnd = new Date(sub.current_period_end * 1000);
      } else {
        periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      
      console.log(`📅 Subscription period: ${periodStart.toISOString()} → ${periodEnd.toISOString()}`);

      // Fallback: get price from subscription items
      if (!priceId && sub.items?.data?.length > 0) {
        priceId = sub.items.data[0].price?.id;
      }
    }

    if (!priceId) {
      console.error('❌ Could not determine price ID from session');
      return res.status(400).json({ success: false, message: 'Could not determine subscription plan.' });
    }

    // Map price ID to plan type
    let planType = 'FREE';
    if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
      planType = 'ELITE';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      planType = 'PRO';
    }

    if (planType === 'FREE') {
      console.error(`❌ Price ID ${priceId} did not match PRO (${process.env.STRIPE_PRO_PRICE_ID}) or ELITE (${process.env.STRIPE_ELITE_PRICE_ID})`);
      return res.status(400).json({ success: false, message: 'Unknown price ID. Cannot determine plan.' });
    }

    console.log(`📌 Session is for ${planType} plan (price: ${priceId})`);

    // ─── STEP 2: NOW check if user is already on this tier or HIGHER ─────────
    // Only skip if the webhook already set the user to the correct or better plan.
    const currentUser = await User.findById(userId);
    const tiers = { 'FREE': 0, 'PRO': 1, 'ELITE': 2 };
    const currentTier = tiers[currentUser.subscription?.plan] || 0;
    const purchasedTier = tiers[planType] || 0;

    if (currentTier >= purchasedTier && currentUser.subscription?.status === 'active') {
      console.log(`✅ User ${userId} already on ${currentUser.subscription.plan} plan (>= ${planType}), skipping update.`);
      return res.status(200).json({
        success: true,
        message: `Successfully subscribed to ${currentUser.subscription.plan} plan.`,
        plan: currentUser.subscription.plan
      });
    }

    // ─── STEP 3: Activate the purchased plan ────────────────────────────────
    // Final safety: ensure periodEnd is always a valid Date
    if (!periodEnd || isNaN(periodEnd.getTime())) {
      periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      console.warn('⚠️ periodEnd was invalid, defaulting to 30 days from now');
    }
    if (!periodStart || isNaN(periodStart.getTime())) {
      periodStart = new Date();
    }

    console.log(`📌 Activating ${planType} plan for user ${userId}`);

    // Update the User record directly
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': planType,
      'subscription.status': 'active',
      'subscription.stripeSubscriptionId': subscriptionId,
      'subscription.currentPeriodEnd': periodEnd,
      'subscription.aiUsageCount': 0
    });

    // Update/Create the Subscription tracking record
    let subRecord = await Subscription.findOne({ user: userId });
    if (!subRecord) {
      subRecord = new Subscription({ user: userId });
    }

    const previousPlan = subRecord.plan || 'FREE';
    const reason = purchasedTier > (tiers[previousPlan] || 0) ? 'upgrade' :
                   purchasedTier < (tiers[previousPlan] || 0) ? 'downgrade' : 'renewal';

    subRecord.recordPlanChange({
      plan: planType,
      status: 'active',
      reason,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      periodStart,
      periodEnd
    });

    await subRecord.save();

    // Log the event
    await logEvent({
      event: 'SUBSCRIPTION_VERIFIED',
      message: `User ${userId} verified and activated ${planType} plan via session ${sessionId}`,
      category: 'BILLING',
      user: userId
    });

    console.log(`✅ Successfully activated ${planType} plan for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${planType} plan.`,
      plan: planType
    });

  } catch (error) {
    console.error('❌ Verify Session Error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to verify session: ' + error.message });
  }
};

module.exports = { createCheckoutSession, handleWebhook, getSubscriptionDetails, verifySession };
