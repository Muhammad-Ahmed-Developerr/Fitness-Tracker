const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

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
        metadata: {
          userId: userId.toString(),
        },
      });
      return session;
    } catch (error) {
      console.error('Stripe Session Error:', error);
      throw new Error('Could not create payment session: ' + error.message);
    }
  }

  /**
   * Retrieves subcription details from Stripe.
   * @param {string} subscriptionId 
   */
  async getSubscriptionDetails(subscriptionId) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }
}

module.exports = new StripeService();
