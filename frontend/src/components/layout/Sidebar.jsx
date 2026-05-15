import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Apple, UserCircle, LogOut, TrendingUp, Settings, HelpCircle, Sparkles, CheckSquare, Target, Flame, CreditCard, ShieldCheck, Lock, Crown, Zap, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const planConfig = {
  ELITE: { label: 'Elite', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', gradient: 'from-purple-600 to-indigo-600' },
  PRO: { label: 'Pro', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', gradient: 'from-cyan-600 to-blue-600' },
  FREE: { label: 'Free', icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', gradient: 'from-gray-600 to-gray-700' }
};

const Sidebar = ({ onNavClick, className = '' }) => {
  const { user, logout } = useAuth();
  const currentPlan = user?.subscription?.plan || 'FREE';
  const config = planConfig[currentPlan] || planConfig.FREE;
  const PlanIcon = config.icon;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'AI Coach', icon: Sparkles, path: '/ai-coach', requiredPlan: 'PRO' },
    { name: 'Workouts', icon: Dumbbell, path: '/workouts' },
    { name: 'Nutrition', icon: Apple, path: '/nutrition' },
    { name: 'Habits', icon: Flame, path: '/habits', requiredPlan: 'PRO' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Progress', icon: TrendingUp, path: '/progress' },
    { name: 'Subscription', icon: CreditCard, path: '/subscription' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Support', icon: HelpCircle, path: '/support' },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
  ];

  const tiers = { 'FREE': 0, 'PRO': 1, 'ELITE': 2 };
  const userTier = tiers[currentPlan] || 0;

  const isLocked = (item) => {
    if (!item.requiredPlan) return false;
    return userTier < (tiers[item.requiredPlan] || 0);
  };

  return (
    <div className={`w-64 glass border-y-0 border-l-0 rounded-none h-full min-h-screen flex flex-col ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-400">
          FitForge AI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-4">Menu</p>
        {navItems.map((item) => {
          const locked = isLocked(item);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent/20 text-accent border border-accent/20' 
                    : 'text-textMuted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.name}</span>
              {locked && (
                <Lock className="w-3.5 h-3.5 text-gray-600" />
              )}
              {item.requiredPlan === 'PRO' && !locked && (
                <Zap className="w-3.5 h-3.5 text-cyan-500/40" />
              )}
            </NavLink>
          );
        })}

        {user?.role === 'admin' && (
          <div className="mt-6 pt-6 border-t border-white/5">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-4">Administration</p>
             {adminNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                        : 'text-textMuted hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
          </div>
        )}
      </nav>

      {/* Plan Badge Widget */}
      <div className="px-4 pb-2">
        <div className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} shadow-lg`}>
              <PlanIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${config.color}`}>
                {config.label} Plan
              </p>
              <p className="text-[10px] text-gray-500">
                {currentPlan === 'ELITE' ? 'All features unlocked' : currentPlan === 'PRO' ? 'Premium features active' : 'Basic features only'}
              </p>
            </div>
          </div>
          {currentPlan !== 'ELITE' && (
            <Link
              to="/subscription"
              onClick={onNavClick}
              className={`block w-full text-center text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                currentPlan === 'FREE' 
                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' 
                  : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              {currentPlan === 'FREE' ? 'Upgrade to PRO' : 'Go ELITE'}
            </Link>
          )}
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 hover:text-red-300 w-full rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
