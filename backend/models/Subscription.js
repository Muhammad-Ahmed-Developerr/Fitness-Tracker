const mongoose = require('mongoose');

const subscriptionHistorySchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['FREE', 'PRO', 'ELITE'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'canceled', 'past_due'],
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    enum: ['upgrade', 'downgrade', 'renewal', 'expiration', 'cancellation', 'initial', 'payment_failed'],
    required: true
  }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['FREE', 'PRO', 'ELITE'],
    default: 'FREE',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'canceled', 'past_due'],
    default: 'inactive',
    required: true
  },
  stripeSubscriptionId: {
    type: String
  },
  stripePriceId: {
    type: String
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  canceledAt: {
    type: Date
  },
  history: [subscriptionHistorySchema]
}, {
  timestamps: true
});

// Compound index for efficient lookups
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });

/**
 * Static: Find or create a subscription record for a user.
 */
subscriptionSchema.statics.findOrCreateForUser = async function(userId) {
  let sub = await this.findOne({ user: userId });
  if (!sub) {
    sub = await this.create({
      user: userId,
      plan: 'FREE',
      status: 'inactive',
      history: [{
        plan: 'FREE',
        status: 'inactive',
        changedAt: new Date(),
        reason: 'initial'
      }]
    });
  }
  return sub;
};

/**
 * Instance: Record a plan change with history tracking.
 */
subscriptionSchema.methods.recordPlanChange = function({ plan, status, reason, stripeSubscriptionId, stripePriceId, periodStart, periodEnd }) {
  const previousPlan = this.plan;
  const previousStatus = this.status;

  this.plan = plan;
  this.status = status;

  if (stripeSubscriptionId) this.stripeSubscriptionId = stripeSubscriptionId;
  if (stripePriceId) this.stripePriceId = stripePriceId;
  if (periodStart) this.currentPeriodStart = periodStart;
  if (periodEnd) this.currentPeriodEnd = periodEnd;

  if (status === 'canceled' || reason === 'cancellation') {
    this.canceledAt = new Date();
  }

  this.history.push({
    plan,
    status,
    changedAt: new Date(),
    reason
  });

  return this;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
