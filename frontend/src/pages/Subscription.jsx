import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon, Zap, Crown, ShieldCheck, Shield, Sparkles, Lock, TrendingUp, Activity, Dumbbell, Apple, FileSpreadsheet, HeartPulse, Target, BarChart3 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);

  const currentPlan = user?.subscription?.plan || 'FREE';

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const { data } = await api.get('/payments/subscription');
      if (data.success) {
        setSubscriptionHistory(data.data.history || []);
      }
    } catch (err) {
      // Non-critical, just won't show history
    }
  };

  const plans = [
    {
      name: 'FREE',
      price: 'Rs 0',
      description: 'Perfect for getting started with fitness tracking',
      icon: Shield,
      color: 'text-gray-400',
      borderColor: 'border-gray-500/20',
      gradientFrom: 'from-gray-600',
      gradientTo: 'to-gray-700',
      features: [
        { text: 'Basic Workout Logging', included: true },
        { text: 'Nutrition Tracking', included: true },
        { text: 'Weight Progress Charts', included: true },
        { text: 'Goal Setting', included: true },
        { text: 'Task Management', included: true },
        { text: 'AI Personal Coach', included: false },
        { text: 'Habit Tracking Rings', included: false },
        { text: 'Advanced Analytics', included: false },
        { text: 'PDF/CSV Export', included: false },
        { text: 'Predictive Forecasts', included: false },
        { text: 'AI Goal Advisor', included: false },
      ],
    },
    {
      name: 'PRO',
      price: 'Rs 3,000',
      description: 'For serious fitness enthusiasts who want AI-powered coaching',
      icon: Zap,
      color: 'text-accent',
      borderColor: 'border-accent/40',
      gradientFrom: 'from-cyan-600',
      gradientTo: 'to-blue-600',
      popular: true,
      features: [
        { text: 'Basic Workout Logging', included: true },
        { text: 'Nutrition Tracking', included: true },
        { text: 'Weight Progress Charts', included: true },
        { text: 'Goal Setting', included: true },
        { text: 'Task Management', included: true },
        { text: 'AI Personal Coach (20/day)', included: true },
        { text: 'Habit Tracking Rings', included: true },
        { text: 'Advanced Analytics & Insights', included: true },
        { text: 'PDF/CSV Export', included: true },
        { text: 'Predictive Forecasts', included: false },
        { text: 'AI Goal Advisor', included: false },
      ],
      priceId: 'PRO',
    },
    {
      name: 'ELITE',
      price: 'Rs 10,000',
      description: 'The ultimate AI fitness companion with full analytics suite',
      icon: Crown,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-indigo-600',
      features: [
        { text: 'Basic Workout Logging', included: true },
        { text: 'Nutrition Tracking', included: true },
        { text: 'Weight Progress Charts', included: true },
        { text: 'Goal Setting', included: true },
        { text: 'Task Management', included: true },
        { text: 'AI Personal Coach (100/day)', included: true },
        { text: 'Habit Tracking Rings', included: true },
        { text: 'Advanced Analytics & Insights', included: true },
        { text: 'PDF/CSV Export', included: true },
        { text: 'Predictive Weight Forecast', included: true },
        { text: 'AI Goal Advisor', included: true },
      ],
      priceId: 'ELITE',
    }
  ];

  const handleSubscription = async (planType) => {
    if (planType === currentPlan) return;
    try {
      setLoading(planType);
      const { data } = await api.post('/payments/create-checkout', { planType });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const currentPlanConfig = plans.find(p => p.name === currentPlan) || plans[0];
  const CurrentPlanIcon = currentPlanConfig.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Current Plan Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 mb-12 border ${currentPlanConfig.borderColor} relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full opacity-10 blur-2xl" 
          style={{ background: currentPlan === 'ELITE' ? '#a855f7' : currentPlan === 'PRO' ? '#00E6FF' : '#6b7280' }} 
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentPlanConfig.gradientFrom} ${currentPlanConfig.gradientTo} shadow-lg`}>
              <CurrentPlanIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Current Plan</p>
              <h2 className={`text-2xl font-black ${currentPlanConfig.color}`}>
                {currentPlan} {currentPlan === 'FREE' ? 'Member' : 'Subscriber'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.subscription?.currentPeriodEnd && currentPlan !== 'FREE' && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Renews</p>
                <p className="text-sm text-white font-bold">
                  {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            {currentPlan === 'FREE' && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lock className="w-4 h-4" />
                <span>Premium features locked</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-textMuted text-lg">Unlock the full power of FitForge AI and accelerate your results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.name;
          const PIcon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-8 flex flex-col relative overflow-hidden ${
                plan.popular ? `${plan.borderColor} scale-105 z-10` : ''
              } ${isCurrentPlan ? `ring-2 ${plan.name === 'ELITE' ? 'ring-purple-500/50' : plan.name === 'PRO' ? 'ring-accent/50' : 'ring-gray-500/30'}` : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-accent text-dark font-bold text-xs px-4 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div className={`absolute top-0 left-0 text-xs px-4 py-1 rounded-br-lg font-black uppercase tracking-widest ${
                  plan.name === 'ELITE' ? 'bg-purple-500 text-white' : plan.name === 'PRO' ? 'bg-accent text-dark' : 'bg-gray-600 text-white'
                }`}>
                  Current
                </div>
              )}
              
              <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradientFrom} ${plan.gradientTo} shadow-lg w-fit mb-6`}>
                <PIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-textMuted">/month</span>
              </div>
              <p className="text-textMuted mb-8 text-sm leading-relaxed">{plan.description}</p>
              
              <ul className="text-left w-full space-y-3 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.included ? (
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.name === 'ELITE' ? 'text-purple-400' : plan.name === 'PRO' ? 'text-accent' : 'text-green-500'}`} />
                    ) : (
                      <XIcon className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscription(plan.name)}
                disabled={plan.name === 'FREE' || isCurrentPlan || loading}
                className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
                  isCurrentPlan 
                    ? 'bg-white/10 text-textMuted cursor-default border border-white/10'
                    : plan.name === 'FREE'
                    ? 'bg-white/5 text-gray-500 cursor-default border border-white/5'
                    : plan.name === 'ELITE'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]'
                    : 'bg-accent text-dark hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,230,255,0.4)]'
                } disabled:opacity-50`}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : plan.name === 'FREE' ? (
                  'Free Forever'
                ) : plan.name === 'ELITE' ? (
                  'Go ELITE'
                ) : (
                  'Upgrade to PRO'
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 glass-card p-8"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Subscription History
          </h3>
          <div className="space-y-3">
            {subscriptionHistory.slice().reverse().slice(0, 10).map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    event.reason === 'upgrade' ? 'bg-green-500' : 
                    event.reason === 'downgrade' || event.reason === 'cancellation' ? 'bg-red-500' : 
                    event.reason === 'payment_failed' ? 'bg-orange-500' : 'bg-accent'
                  }`} />
                  <span className="text-sm text-gray-300 font-medium capitalize">{event.reason}</span>
                  <span className="text-xs text-gray-500">→</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${
                    event.plan === 'ELITE' ? 'text-purple-400' : event.plan === 'PRO' ? 'text-accent' : 'text-gray-400'
                  }`}>{event.plan}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold">
                  {new Date(event.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-16 glass-card p-8 text-center border-dashed border-white/10">
        <p className="text-textMuted mb-4">Questions about our plans? Contact our support team for a personalized recommendation.</p>
        <button className="text-accent font-bold hover:underline">Chat with Support</button>
      </div>
    </div>
  );
};

export default Subscription;
