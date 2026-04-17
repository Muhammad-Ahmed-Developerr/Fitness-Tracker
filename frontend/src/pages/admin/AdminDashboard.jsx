import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Dumbbell, LifeBuoy, TrendingUp, Activity, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    fetchAdminStats();
    fetchRecentNotifications();
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
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch admin stats');
      // Mock data for demo purposes
      setStats({
        totalUsers: 1250,
        activeWorkouts: 450,
        pendingTickets: 12,
        growth: '+15%',
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
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', border: 'border-blue-500/30' },
    { title: 'Active Workouts', value: stats?.activeWorkouts || 0, icon: Dumbbell, color: 'text-accent', border: 'border-accent/30' },
    { title: 'Support Tickets', value: stats?.pendingTickets || 0, icon: LifeBuoy, color: 'text-orange-400', border: 'border-orange-500/30' },
    { title: 'Weekly Growth', value: stats?.growth || '0%', icon: TrendingUp, color: 'text-green-400', border: 'border-green-500/30' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white italic tracking-tight">Admin Control Center</h1>
          <p className="text-gray-400 mt-1">Manage users, system status, and performance metrics.</p>
        </div>
        <div className="flex gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold">
                <CheckCircle className="w-3 h-3" /> System Live
            </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`glass-card p-6 border-t-4 ${stat.border}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-3xl font-black text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Platform Activity
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

        {/* Recent Notifications */}
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> Recent Notifications
            </h3>
            <div className="space-y-4">
                {recentNotifications.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-sm italic">No recent dispatch history.</p>
                    </div>
                ) : (
                    recentNotifications.map((note) => (
                        <div key={note._id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-purple-400 font-bold overflow-hidden">
                                {note.user?.name.substring(0, 2) || 'SYS'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">{note.message}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{new Date(note.createdAt).toLocaleTimeString()} • {note.user?.name || 'All Users'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <button 
                onClick={() => window.location.href = '/admin/notifications'}
                className="w-full mt-6 py-3 border border-purple-500/20 rounded-xl text-purple-400 text-sm font-bold hover:bg-purple-500/10 transition-all uppercase tracking-widest"
            >
                Manage Notifications
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
