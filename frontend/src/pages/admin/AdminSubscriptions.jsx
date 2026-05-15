import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CreditCard, Mail, Calendar, User, Download, TrendingUp, Shield } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/subscriptions');
      setSubscriptions(res.data.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || sub.subscription.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const handleExport = () => {
    if (filteredSubscriptions.length === 0) return toast.error('No data to export');
    
    const headers = ['User', 'Email', 'Plan', 'Status', 'Expiry Date'];
    const rows = filteredSubscriptions.map(s => [
        s.name,
        s.email,
        s.subscription.plan,
        s.subscription.status,
        new Date(s.subscription.currentPeriodEnd).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FitForge_Subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscription Registry Exported');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-400" /> Premium Subscriptions
          </h1>
          <p className="text-gray-400 mt-1">Manage and monitor all paying customers.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">Active Revenue</p>
                <p className="text-xl font-black text-white">${subscriptions.length * 19}.00<span className="text-[10px] text-gray-500 font-normal">/mo</span></p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Total Premium</p>
                <p className="text-xl font-black text-white">{subscriptions.length} <span className="text-[10px] text-gray-500 font-normal">Users</span></p>
            </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A2740] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select 
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 bg-[#021B32] border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-accent/50"
            >
                <option value="ALL">All Plans</option>
                <option value="PRO">PRO Plan</option>
                <option value="ELITE">ELITE Plan</option>
            </select>

            <button 
                onClick={handleExport}
                className="px-6 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent text-xs font-black uppercase tracking-widest hover:bg-accent/20 transition-all flex items-center gap-2"
            >
                <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-bold">Subscriber</th>
                <th className="px-6 py-4 font-bold">Plan Details</th>
                <th className="px-6 py-4 font-bold">Next Billing</th>
                <th className="px-6 py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                  <tr>
                    <td colSpan="4">
                      <Loader fullScreen={false} message="Loading Subscription Data..." />
                    </td>
                  </tr>
              ) : filteredSubscriptions.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-20 text-gray-500">No active subscriptions found.</td></tr>
              ) : filteredSubscriptions.map((sub) => (
                <tr key={sub._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                        sub.subscription.plan === 'ELITE' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{sub.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            sub.subscription.plan === 'ELITE' ? 'text-purple-400' : 'text-green-400'
                        }`}>
                            {sub.subscription.plan} MEMBERSHIP
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            ID: {sub.subscription.stripeSubscriptionId?.substring(0, 12)}...
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400 flex items-center gap-2 font-mono">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        {sub.subscription.currentPeriodEnd ? new Date(sub.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      sub.subscription.status === 'active' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {sub.subscription.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-green-500/5 to-transparent">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" /> Revenue Insight
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
                The current subscription base is generating steady recurring revenue. 
                Focus on converting <strong>FREE</strong> tier users to <strong>PRO</strong> to increase the active sync rate.
            </p>
        </div>
        <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Plan Retention
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
                <strong>ELITE</strong> members have 3x higher engagement than regular users. 
                Consider adding more AI-exclusive features to drive ELITE adoption.
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSubscriptions;
