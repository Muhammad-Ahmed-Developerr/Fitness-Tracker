import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Apple, Dumbbell, Coffee, Info, RefreshCw, Lock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AICoach = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const isPremium = user?.subscription?.plan !== 'FREE';

  useEffect(() => {
    if (isPremium) {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [isPremium]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/ai/plan');
      if (data.success) {
        setPlan(data.data);
      }
    } catch (error) {
      // 404 is expected if no plan exists yet
      if (error.response?.status !== 404) {
        toast.error('Failed to load AI plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user.profileData?.age || !user.profileData?.weight) {
      toast.error('Please complete your health profile in Settings first!');
      return;
    }

    try {
      setGenerating(true);
      toast.loading('AI Coach is crafting your plan...', { id: 'ai-gen' });
      const { data } = await api.post('/ai/generate');
      setPlan(data.data);
      toast.success(data.cached ? 'Plan retrieved from cache.' : 'New plan generated successfully!', { id: 'ai-gen' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Plan generation failed', { id: 'ai-gen' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-textMuted animate-pulse font-mono uppercase tracking-widest text-sm">Synchronizing AI Node...</p>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center px-4">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Lock className="w-64 h-64"/></div>
          <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">AI Coach is Locked</h1>
          <p className="text-textMuted text-lg mb-8 max-w-lg mx-auto">
            Get personalized meal plans, weekly workout structures, and expert recommendations powered by Gemini AI.
          </p>
          <Link to="/subscription" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
            Upgrade to PRO <RefreshCw className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-accent w-8 h-8"/> AI Strategic Coach
          </h1>
          <p className="text-textMuted font-mono text-sm uppercase tracking-wider">Plan generated based on your latest biometric profile.</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="btn-primary flex items-center gap-2 h-12 px-6"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {plan ? 'Re-Sync AI Plan' : 'Generate Initial Plan'}
        </button>
      </div>

      {!plan ? (
        <div className="glass-card p-20 text-center flex flex-col items-center border-dashed border-2 border-white/10">
          <Info className="w-12 h-12 text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Initiate AI Intelligence</h2>
          <p className="text-textMuted max-w-sm mb-8">Click the button above to analyze your metrics and generate your first personalized health plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Meal Plan Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-[#021B32] to-[#0A2740] border border-white/5"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Apple className="text-orange-400" /> Daily Metabolic Intake
            </h3>
            <div className="space-y-6">
              {Object.entries(plan.mealPlan || {}).filter(([k]) => k !== 'snacks').map(([meal, desc]) => (
                <div key={meal} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{meal}</span>
                  <p className="text-gray-300 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Recommended Snacks</span>
                <ul className="mt-2 space-y-1">
                  {(plan.mealPlan?.snacks || []).map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                       <div className="w-1 h-1 bg-orange-400 rounded-full" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Workout & Lifestyle Section */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border border-white/5"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Dumbbell className="text-blue-400" /> Strategic Workout Cycle
              </h3>
              <div className="space-y-4">
                {(plan.workoutPlan?.weeklyStructure || []).map((day, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400">
                      D{i+1}
                    </div>
                    <p className="text-gray-300 text-sm flex-1">{day}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border border-white/5 bg-slate-900/40"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Coffee className="text-yellow-400" /> Lifestyle & Habit Nodes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Foods to Prioritize</span>
                  <ul className="mt-3 space-y-2">
                    {(plan.recommendations?.toEat || []).map((f, i) => (
                       <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {f}
                       </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Foods to Restrict</span>
                  <ul className="mt-3 space-y-2">
                    {(plan.recommendations?.toAvoid || []).map((f, i) => (
                       <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full rotate-45" /> {f}
                       </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[10px] block text-textMuted uppercase mb-1">Hydration</span>
                  <p className="text-xs text-white">{plan.recommendations?.hydration}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="text-[10px] block text-textMuted uppercase mb-1">Recovery Sleep</span>
                  <p className="text-xs text-white">{plan.recommendations?.sleep}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
