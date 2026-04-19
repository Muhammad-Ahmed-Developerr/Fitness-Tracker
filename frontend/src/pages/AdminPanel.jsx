import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Sparkles, Activity, Search, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  const fetchAdminMetrics = async () => {
    try {
      setLoading(true);
      // In a real app, this would be a dedicated admin endpoint
      // For now, we'll mock some data or use a conceptual endpoint
      // const { data } = await api.get('/admin/metrics');
      
      // Mocking for demonstration since Step 11 (Admin Backend) is later
      setTimeout(() => {
        setMetrics({
          totalUsers: 1240,
          activeSubscriptions: 450,
          monthlyRevenue: '$4,495.50',
          aiRequestsToday: 89,
          plansDistribution: { FREE: 790, PRO: 310, ELITE: 140 }
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to load admin intelligence');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-textMuted animate-pulse font-mono px-4 text-center italic">AUTHORIZED ACCESS ONLY - DECRYPTING ADMIN NODES...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldAlert className="text-red-500 w-8 h-8"/> Central Admin Directive
        </h1>
        <p className="text-textMuted font-mono text-xs uppercase tracking-widest">Global system oversight and revenue monitoring.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-textMuted text-xs font-bold uppercase tracking-widest">Total Population</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics.totalUsers}</p>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-textMuted text-xs font-bold uppercase tracking-widest">Total Revenue</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics.monthlyRevenue}</p>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-textMuted text-xs font-bold uppercase tracking-widest">AI Queries / 24h</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics.aiRequestsToday}</p>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-textMuted text-xs font-bold uppercase tracking-widest">Active nodes</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics.activeSubscriptions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Distribution */}
        <div className="glass-card p-8 border-white/5 bg-slate-900/40">
           <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <LayoutDashboard className="w-5 h-5 text-accent" /> Plan Segmentations
           </h3>
           <div className="space-y-6">
              {Object.entries(metrics.plansDistribution).map(([plan, count]) => {
                const total = metrics.totalUsers;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={plan}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-bold text-gray-300">{plan}</span>
                       <span className="text-xs text-textMuted">{count} users ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
        </div>

        {/* System Logs / Placeholder */}
        <div className="glass-card p-8 border-white/5 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-red-400" /> Authorized System Logs
            </h3>
            <div className="space-y-4 font-mono text-xs">
               <div className="flex gap-4 text-green-400">
                  <span>[21:10:45]</span>
                  <span>SYSTEM_HEALTH_OK: API latency 24ms</span>
               </div>
               <div className="flex gap-4 text-accent">
                  <span>[21:05:12]</span>
                  <span>EVENT: New ELITE subscription initialized (ID: ...892)</span>
               </div>
               <div className="flex gap-4 text-textMuted italic">
                  <span>[20:58:33]</span>
                  <span>GEMINI_AI_REVOLVE: Plan generation optimized for user_662</span>
               </div>
               <div className="flex gap-4 text-red-400">
                  <span>[20:44:10]</span>
                  <span>WARNING: Unusual login pattern detected from IP: 192.x.x.x</span>
               </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
               <button className="text-accent text-sm font-bold hover:underline flex items-center gap-2">
                 Access Full Log Registry <Search className="w-4 h-4" />
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
