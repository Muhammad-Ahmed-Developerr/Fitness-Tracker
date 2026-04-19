import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      description: 'Perfect for starters',
      features: ['Basic Workout Logging', 'Nutrition Tracking', 'Weight Progress Charts'],
      icon: Zap,
      color: 'text-gray-400',
      btnText: 'Current Plan',
      disabled: true,
    },
    {
      name: 'PRO',
      price: '$9.99',
      description: 'For serious fitness enthusiasts',
      features: ['Everything in FREE', 'AI Personal Coach', 'Habit Tracking Rings', 'Advanced Analytics'],
      icon: Crown,
      color: 'text-accent',
      btnText: 'Upgrade to PRO',
      priceId: 'PRO', // This will map to Stripe Price ID on backend
    },
    {
      name: 'ELITE',
      price: '$19.99',
      description: 'The ultimate fitness companion',
      features: ['Everything in PRO', 'Predictive Analytics', 'Muscle Group Distribution', 'Personalized Goal AI'],
      icon: ShieldCheck,
      color: 'text-purple-400',
      btnText: 'Go ELITE',
      priceId: 'ELITE',
    }
  ];

  const handleSubscription = async (planType) => {
    try {
      setLoading(planType);
      const { data } = await api.post('/payments/create-checkout', { planType });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-textMuted text-lg">Unlock the full power of FitForge AI and accelerate your results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isCurrentPlan = user?.subscription?.plan === plan.name;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-8 flex flex-col items-center text-center relative overflow-hidden ${
                plan.name === 'PRO' ? 'border-accent/40 scale-105 z-10' : ''
              }`}
            >
              {plan.name === 'PRO' && (
                <div className="absolute top-0 right-0 bg-accent text-dark font-bold text-xs px-4 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              <plan.icon className={`w-12 h-12 mb-6 ${plan.color}`} />
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-textMuted">/month</span>
              </div>
              <p className="text-textMuted mb-8 text-sm">{plan.description}</p>
              
              <ul className="text-left w-full space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscription(plan.name)}
                disabled={plan.disabled || isCurrentPlan || loading}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isCurrentPlan 
                    ? 'bg-white/10 text-textMuted cursor-default'
                    : 'bg-accent text-dark hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,230,255,0.4)]'
                } disabled:opacity-50`}
              >
                {loading === plan.name ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.btnText}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 glass-card p-8 text-center border-dashed border-white/10">
        <p className="text-textMuted mb-4">Questions about our plans? Contact our support team for a personalized recommendation.</p>
        <button className="text-accent font-bold hover:underline">Chat with Support</button>
      </div>
    </div>
  );
};

export default Subscription;
