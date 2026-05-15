const getStripe = require('../config/stripe');

/**
 * Service to handle Stripe operations.
 */
class StripeService {
  /**
   * Creates a Stripe Checkout Session for a subscription.
   * @param {string} userId - ID of the user
   * @param {string} email - Email of the user
   * @param {string} priceId - Stripe Price ID for the plan
   * @returns {Object} checkout session
   */
  async createCheckoutSession(userId, email, priceId) {
    try {
      const stripe = getStripe();
      if (!stripe) throw new Error('Stripe is not initialized.');

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription?canceled=true`,
        subscription_data: {
          metadata: {
            userId: userId.toString(),
          },
        },
        metadata: {
          userId: userId.toString(),
        },
      });
      return session;
    } catch (error) {
      console.error('❌ [StripeService] Session Error:', error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Retrieves subcription details from Stripe.
   * @param {string} subscriptionId 
   */
  async getSubscriptionDetails(subscriptionId) {
    const stripe = getStripe();
    return await stripe.subscriptions.retrieve(subscriptionId);
  }
}

module.exports = new StripeService();
