import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { Dumbbell, Flame, TrendingUp, TrendingDown, Download, Plus, Zap, FileSpreadsheet, Apple, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DateFilter from '../components/common/DateFilter';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDashboardData();
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
     try {
       const res = await api.get('/reminders');
       if (res.data.data) {
         setReminders(res.data.data.filter(r => r.status === 'Pending').slice(0, 3));
       }
     } catch (err) {}
  };

  const handleExportPDF = async () => {}; 
  const handleExportCSV = async () => {};

  const renderTrend = (trendObj) => {
      if (!trendObj) return null;
      const { percentageChange, direction } = trendObj;
      if (direction === 'up') {
          return <span className="flex items-center text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20"><TrendingUp className="w-3 h-3 mr-1"/> +{percentageChange}%</span>;
      }
      if (direction === 'down') {
          return <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20"><TrendingDown className="w-3 h-3 mr-1"/> {percentageChange}%</span>;
      }
      return <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-md border border-gray-500/20">— 0%</span>;
  }

  const { summary, charts } = data || {};
  const PIE_COLORS = ['#00E6FF', '#0284c7', '#3b82f6', '#a855f7'];

  const macros = charts?.workoutCategoryFreq?.map(item => ({ name: item._id, value: item.count })) || [];
  const recentNutrition = charts?.recentNutrition?.map(item => ({ date: item._id, volume: item.totalCalories })) || [];
  const weightProgress = charts?.weightProgress?.map(item => ({ 
      date: new Date(item.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}), 
      weight: item.weight 
  })) || [];
  
  const streakDays = Math.floor(Math.random() * 5) + 2; 

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative glass-card border-none p-8 md:p-12 mb-8 items-center bg-gradient-to-br from-[#021B32] via-[#0A2740] to-slate-900 shadow-2xl z-20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl mix-blend-screen -z-10"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center z-10 relative">
          <div className="flex-1 mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              Dashboard Overview, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">{user?.name?.split(' ')[0]}</span>.
            </h1>
            <p className="text-gray-300 text-lg max-w-xl font-medium">
              Monitor your metrics precisely. Every kilogram, every calorie, aggressively tracked across your selected timeline.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <DateFilter onFilterChange={setDateRange} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
        </div>
      ) : (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex items-center p-6 border-accent/30 border-t-accent shadow-lg shadow-accent/5">
                <div className="p-4 bg-accent/10 rounded-xl mr-5 border border-accent/20">
                    <Dumbbell className="h-7 w-7 text-accent" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Workouts</p>
                    <div className="flex items-end gap-3 mt-1">
                        <h3 className="text-3xl font-black text-white">{summary?.metrics?.workouts?.value || 0}</h3>
                        {renderTrend(summary?.metrics?.workouts?.trend)}
                    </div>
                </div>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex items-center p-6 border-orange-500/30 border-t-orange-500 shadow-lg shadow-orange-500/5">
                <div className="p-4 bg-orange-500/10 rounded-xl mr-5 border border-orange-500/20">
                    <Flame className="h-7 w-7 text-orange-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Calories Recorded</p>
                    <div className="flex items-end gap-3 mt-1">
                        <h3 className="text-3xl font-black text-white">{summary?.metrics?.calories?.value || 0}</h3>
                        {renderTrend(summary?.metrics?.calories?.trend)}
                    </div>
                    {summary?.metrics?.macros && (
                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/5 w-full flex-wrap">
                           <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">P: {summary.metrics.macros.protein}g</span>
                           <span className="text-[10px] text-orange-300 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">C: {summary.metrics.macros.carbs}g</span>
                           <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">F: {summary.metrics.macros.fats}g</span>
                        </div>
                    )}
                </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="glass-card flex items-center p-6 border-green-500/30 border-t-green-500 shadow-lg shadow-green-500/5">
                <div className="p-4 bg-green-500/10 rounded-xl mr-5 border border-green-500/20">
                    <Scale className="h-7 w-7 text-green-500" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Weight Change (kg)</p>
                    <div className="flex items-end gap-3 mt-1">
                        <h3 className="text-3xl font-black text-white">
                            {summary?.currentWeight || 0} <span className="text-[10px] text-gray-500 align-top tracking-widest">kg</span>
                        </h3>
                        {renderTrend(summary?.metrics?.weightChange?.trend)}
                    </div>
                </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-card p-6 h-[400px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="w-48 h-48"/></div>
                <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2"><Scale className="w-5 h-5 text-accent" /> Weight Trend</h3>
                {weightProgress.length > 0 ? (
                    <div className="flex-1 min-h-[250px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <filter id="glowDash" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                            <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dx={-10} domain={['dataMin - 2', 'auto']} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(2, 27, 50, 0.9)', borderColor: '#00E6FF', borderRadius: '12px', backdropFilter: 'blur(8px)' }} itemStyle={{ color: '#00E6FF', fontWeight: 'bold' }} />
                            <Line type="monotone" name="Weight (kg)" dataKey="weight" stroke="#00E6FF" strokeWidth={3} dot={{ r: 4, fill: '#0A2740', stroke: '#00E6FF', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00E6FF', filter: 'url(#glowDash)' }} filter="url(#glowDash)" animationDuration={1000} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 relative z-10">
                    <Scale className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-sm">No weight data available in this timeframe.</p>
                    <Link to="/progress" className="text-accent hover:text-white transition mt-2 text-sm font-bold bg-accent/10 px-4 py-2 rounded-lg border border-accent/20">Log Baseline Data</Link>
                    </div>
                )}
                </div>

                <div className="glass-card p-6 h-[400px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><BarChart className="w-48 h-48"/></div>
                <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Daily Calories</h3>
                {recentNutrition.length > 0 ? (
                    <div className="flex-1 min-h-[250px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recentNutrition}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dx={-10} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(2, 27, 50, 0.9)', borderColor: '#00E6FF', borderRadius: '12px', backdropFilter: 'blur(8px)' }} itemStyle={{ color: '#00E6FF', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar name="Calories" dataKey="volume" fill="url(#colorVolumeDash)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        </Bar>
                        <defs>
                            <linearGradient id="colorVolumeDash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E6FF" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#0284c7" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 relative z-10">
                    <Apple className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-sm">No nutritional data computed in this timeframe.</p>
                    <Link to="/nutrition" className="text-accent hover:text-white transition mt-2 text-sm font-bold bg-accent/10 px-4 py-2 rounded-lg border border-accent/20">Aggregate Diet</Link>
                    </div>
                )}
                </div>
            </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
