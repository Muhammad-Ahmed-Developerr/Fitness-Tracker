const stripe = require('stripe');

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        console.error('❌ STRIPE_SECRET_KEY is missing in .env');
        return null;
    }
    return stripe(key);
};

module.exports = getStripe;
