import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Bed, Footprints, Plus, Minus, Lock, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Habits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPremium = user?.subscription?.plan !== 'FREE';

  const defaultHabits = [
    { type: 'Steps', icon: Footprints, color: 'text-orange-400', unit: 'steps', target: 10000, currentValue: 0 },
    { type: 'Water', icon: Droplets, color: 'text-blue-400', unit: 'ml', target: 3000, currentValue: 0 },
    { type: 'Sleep', icon: Bed, color: 'text-purple-400', unit: 'hrs', target: 8, currentValue: 0 }
  ];

  useEffect(() => {
    if (isPremium) fetchHabits();
    else setLoading(false);
  }, [isPremium]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/habits');
      // Merge defaults with DB data
      const merged = defaultHabits.map(def => {
        const found = data.data.find(h => h.type === def.type);
        return found ? { ...def, ...found } : def;
      });
      setHabits(merged);
    } catch (error) {
      toast.error('Failed to load daily habits');
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (type, newValue) => {
    const habit = habits.find(h => h.type === type);
    const updatedValue = Math.max(0, newValue);
    
    try {
      const { data } = await api.post('/habits', {
        type,
        value: updatedValue,
        target: habit.target,
        unit: habit.unit
      });
      
      setHabits(habits.map(h => h.type === type ? { ...h, ...data.data } : h));
    } catch (error) {
      toast.error('Could not sync habit data');
    }
  };

  const CircularProgress = ({ value, target, colorClass }) => {
    const percentage = Math.min(100, Math.round((value / target) * 100));
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${colorClass} transition-all duration-700 ease-out`} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-white">{percentage}%</span>
          <span className="text-[10px] text-textMuted uppercase font-bold tracking-widest">Progress</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-textMuted animate-pulse font-mono px-4 text-center">ACCESSING DAILY HABIT PROTOCOLS...</p>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center px-4">
        <div className="glass-card p-12 relative overflow-hidden bg-gradient-to-br from-[#0B1521] to-[#0A2740]">
          <div className="absolute -top-10 -left-10 opacity-5"><Flame className="w-80 h-80"/></div>
          <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Habit Rings are Premium</h1>
          <p className="text-textMuted text-lg mb-8 max-w-lg mx-auto">
            Track your steps, hydration, and sleep with beautiful interactive rings and maintain daily streaks.
          </p>
          <Link to="/subscription" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
            Unlock Habits <Lock className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Flame className="text-accent w-8 h-8"/> Daily Habit Clusters
        </h1>
        <p className="text-textMuted">Maintain consistency to optimize biological performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/20 ${habit.color}`}>
                  <habit.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white">{habit.type}</h3>
              </div>
              <span className="text-xs text-textMuted font-mono">Target: {habit.target} {habit.unit}</span>
            </div>

            <CircularProgress value={habit.currentValue} target={habit.target} colorClass={habit.color} />

            <div className="mt-8 flex items-center justify-between w-full bg-black/20 p-4 rounded-2xl border border-white/5">
              <button 
                onClick={() => updateHabit(habit.type, habit.currentValue - (habit.type === 'Steps' ? 500 : habit.type === 'Water' ? 250 : 0.5))}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                disabled={habit.currentValue <= 0}
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <span className="text-xl font-black text-white">{habit.currentValue}</span>
                <span className="text-[10px] block text-textMuted uppercase">{habit.unit}</span>
              </div>

              <button 
                 onClick={() => updateHabit(habit.type, habit.currentValue + (habit.type === 'Steps' ? 500 : habit.type === 'Water' ? 250 : 0.5))}
                 className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 glass-card p-6 flex items-center gap-4 bg-accent/5 border-accent/20">
        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white">Daily Consistency Streak</h4>
          <p className="text-sm text-textMuted text-gray-400">Complete all 3 habits today to extend your streak and earn +50 XP!</p>
        </div>
      </div>
    </div>
  );
};

export default Habits;
