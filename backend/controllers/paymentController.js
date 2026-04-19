const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const User = require('../models/User');
const stripeService = require('../services/stripeService');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured in this environment.' });
    }
    const { planType } = req.body; // e.g., 'PRO' or 'ELITE'
    
    // Map plans to Stripe Price IDs (In production, move to config or .env)
    const priceIds = {
      PRO: process.env.STRIPE_PRO_PRICE_ID,
      ELITE: process.env.STRIPE_ELITE_PRICE_ID
    };

    if (!priceIds[planType]) {
      return res.status(400).json({ success: false, message: 'Invalid plan type selected.' });
    }

    const session = await stripeService.createCheckoutSession(
      req.user._id,
      req.user.email,
      priceIds[planType]
    );

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
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
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Helper to update user plan after checkout
 */
async function updateUserSubscription(userId, subscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planType = subscription.items.data[0].price.id === process.env.STRIPE_PRO_PRICE_ID ? 'PRO' : 'ELITE';

  await User.findByIdAndUpdate(userId, {
    'subscription.plan': planType,
    'subscription.status': 'active',
    'subscription.stripeSubscriptionId': subscriptionId,
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
  });
}

/**
 * Helper to sync subscription status (cancelations/expirations)
 */
async function syncSubscriptionStatus(subscription) {
  const status = subscription.status === 'active' ? 'active' : 'inactive';
  const userId = subscription.metadata.userId;

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
    });
  } else {
    // If metadata not present (unlikely with our setup), lookup by subscription ID
    await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': subscription.id },
        { 
            'subscription.status': status,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
        }
    );
  }
}

module.exports = { createCheckoutSession, handleWebhook };
