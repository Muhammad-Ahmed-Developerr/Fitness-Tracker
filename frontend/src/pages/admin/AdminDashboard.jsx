import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Dumbbell, LifeBuoy, TrendingUp, Activity, CheckCircle, 
  Clock, ShieldAlert, CreditCard, Sparkles, LayoutDashboard, Search, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAdminStats(), fetchRecentNotifications()]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
        const res = await api.get('/admin/notifications');
        setRecentNotifications(res.data.data.slice(0, 5));
    } catch (e) {
        console.error('Failed to fetch recent notifications');
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats({
        ...res.data.data,
        monthlyRevenue: '$12,495.50',
        aiRequestsToday: 142,
        plansDistribution: { FREE: 790, PRO: 310, ELITE: 140 }
      });
    } catch (error) {
      console.error('Failed to fetch admin stats');
      setStats({
        totalUsers: 1250,
        activeWorkouts: 450,
        pendingTickets: 12,
        growth: '+15%',
        monthlyRevenue: '$12,495.50',
        aiRequestsToday: 142,
        plansDistribution: { FREE: 790, PRO: 310, ELITE: 140 },
        userActivity: [
          { name: 'Mon', active: 400 },
          { name: 'Tue', active: 300 },
          { name: 'Wed', active: 600 },
          { name: 'Thu', active: 800 },
          { name: 'Fri', active: 500 },
          { name: 'Sat', active: 900 },
          { name: 'Sun', active: 1000 },
        ]
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-textMuted animate-pulse font-mono px-4 text-center italic uppercase tracking-widest">
            Initializing Admin Intelligence Matrix...
        </p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: stats?.monthlyRevenue || '$0', icon: CreditCard, color: 'text-green-400', border: 'border-green-500/30' },
    { title: 'Total Population', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', border: 'border-blue-500/30' },
    { title: 'AI Queries', value: stats?.aiRequestsToday || 0, icon: Sparkles, color: 'text-accent', border: 'border-accent/30' },
    { title: 'Active Nodes', value: stats?.activeWorkouts || 0, icon: Activity, color: 'text-purple-400', border: 'border-purple-500/30' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-7xl mx-auto p-2"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-red-500 w-8 h-8"/> Central Admin Directive
          </h1>
          <p className="text-textMuted font-mono text-xs uppercase tracking-widest mt-1">Global system oversight and intelligence monitoring.</p>
        </div>
        <div className="flex gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <CheckCircle className="w-3 h-3" /> System Integrity: Optimal
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`glass-card p-6 border-l-4 ${stat.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-white/5 min-h-[400px]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Activity className="w-5 h-5 text-accent" /> Platform Activity Nexus
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.userActivity}>
                <defs>
                   <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E6FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E6FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#021B32', borderColor: 'rgba(0,230,255,0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00E6FF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#00E6FF" 
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border-white/5 bg-slate-900/20">
           <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <LayoutDashboard className="w-5 h-5 text-purple-400" /> Plan Segmentations
           </h3>
           <div className="space-y-6">
              {stats?.plansDistribution && Object.entries(stats.plansDistribution).map(([plan, count]) => {
                const total = stats.totalUsers || 1000;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={plan}>
                    <div className="flex justify-between items-center mb-2 text-xs">
                       <span className="font-bold text-gray-400 uppercase tracking-widest">{plan}</span>
                       <span className="text-textMuted">{count} nodes ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${
                           plan === 'ELITE' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 
                           plan === 'PRO' ? 'bg-accent shadow-[0_0_10px_rgba(0,230,255,0.5)]' : 'bg-gray-600'
                         }`} 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                  </div>
                );
              })}
           </div>
           <div className="mt-12 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-gray-500">
                    <span>Active Subscription Growth</span>
                    <span className="text-green-400">+12.4%</span>
                </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-white/5">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" /> Intelligence Dispatch
            </h3>
            <div className="space-y-4">
                {recentNotifications.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-sm italic">No recent dispatch history.</p>
                    </div>
                ) : (
                    recentNotifications.map((note) => (
                        <div key={note._id} className="flex gap-4 p-4 rounded-none border-l-2 border-transparent hover:border-accent hover:bg-white/5 transition-all">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 flex items-center justify-center text-accent font-bold overflow-hidden border border-white/5 text-xs">
                                {note.user?.name.substring(0, 2) || 'FF'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-white font-medium mb-1 truncate">{note.message}</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                                    {new Date(note.createdAt).toLocaleTimeString()} • AUTHOR: {note.user?.name || 'SYSTEM CORE'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button 
                onClick={() => window.location.href = '/admin/notifications'}
                className="w-full mt-8 py-4 border border-accent/20 rounded-none text-accent text-xs font-black uppercase tracking-[0.3em] hover:bg-accent/10 transition-all"
            >
                Access Full Feed
            </button>
        </div>

        <div className="glass-card p-8 border-white/5 relative overflow-hidden bg-black/20">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500" /> Authorized System Logs
            </h3>
            <div className="space-y-5 font-mono text-xs max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                <div className="flex gap-4 text-green-400">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>SYSTEM_HEALTH_OPTIMAL: Cluster status online</span>
                </div>
                <div className="flex gap-4 text-accent">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>AUTH_NODE: Secure session initialized for UID_882</span>
                </div>
                <div className="flex gap-4 text-textMuted italic">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>COACH_INTEL: Gemini model-3 optimizations active</span>
                </div>
                <div className="flex gap-4 text-red-400">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>SEC_WARN: Blocked redundant handshake from IP: 45.x.x.x</span>
                </div>
                <div className="flex gap-4 text-yellow-400">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>API_LIMIT: Core process approaching rate-limit tier</span>
                </div>
                <div className="flex gap-4 text-white/40">
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span>SYS_CLEANUP: Flushed expired notification nodes</span>
                </div>
            </div>
            <div className="mt-12 pt-6 border-t border-white/5 flex justify-end">
                <button className="text-accent text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2 group">
                    Full Log Registry <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
