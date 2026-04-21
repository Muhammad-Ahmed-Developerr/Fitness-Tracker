import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Dumbbell, Apple, UserCircle, LogOut, 
  TrendingUp, Settings, HelpCircle, Sparkles, Activity, CheckSquare, 
  Target, Flame, CreditCard, ShieldCheck, Bell, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onNavClick, className = '', isAdmin = false }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'AI Coach', icon: Sparkles, path: '/ai-coach' },
    { name: 'Workouts', icon: Dumbbell, path: '/workouts' },
    { name: 'Nutrition', icon: Apple, path: '/nutrition' },
    { name: 'Habits', icon: Flame, path: '/habits' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Progress', icon: TrendingUp, path: '/progress' },
    { name: 'Subscription', icon: CreditCard, path: '/subscription' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Support', icon: HelpCircle, path: '/support' },
  ];

  const adminNavItems = [
    { name: 'Admin Stats', icon: ShieldCheck, path: '/admin' },
    { name: 'User Management', icon: UserCircle, path: '/admin/users' },
    { name: 'System Analytics', icon: TrendingUp, path: '/admin/analytics' },
    { name: 'Support Tickets', icon: HelpCircle, path: '/admin/support' },
    { name: 'System Alerts', icon: Bell, path: '/admin/notifications' },
  ];

  return (
    <div className={`w-64 glass-side border-y-0 border-l-0 h-full min-h-screen flex flex-col ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-400">
          FitForge
        </h1>
        {isAdmin && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mt-1 block px-0.5">Admin Console</span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {isAdmin ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400/60 mb-2 px-4">Management</p>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-none border-l-4 transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/80 shadow-[inset_4px_0_10px_rgba(168,85,247,0.1)]' 
                      : 'text-textMuted hover:bg-white/5 hover:text-white border-transparent'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
            
            <div className="mt-8 pt-8 border-t border-white/5 px-2">
                <Link 
                    to="/dashboard"
                    onClick={onNavClick}
                    className="flex items-center gap-2 text-xs font-bold text-accent hover:text-white transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to User View
                </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-4">Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-none border-l-4 transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent/10 text-accent border-accent/80 shadow-[inset_4px_0_10px_rgba(0,230,255,0.1)]' 
                      : 'text-textMuted hover:bg-white/5 hover:text-white border-transparent'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400/60 mb-2 px-4">System</p>
                <Link 
                    to="/admin" 
                    onClick={onNavClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-400 hover:bg-purple-500/10 transition"
                >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                </Link>
              </div>
            )}
          </>
        )}
      </nav>

      <div className="p-4 mt-auto">
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
