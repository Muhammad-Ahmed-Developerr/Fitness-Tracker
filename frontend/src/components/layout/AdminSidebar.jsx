import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ArrowLeft, ShieldAlert, BarChart3, Database, Bell, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ onNavClick, className = '' }) => {
  const { logout } = useAuth();

  const adminNavItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { name: 'Support Desk', icon: LifeBuoy, path: '/admin/support' },
  ];

  return (
    <div className={`w-64 bg-[#07111a] border-r border-white/5 h-full min-h-screen flex flex-col ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
          ADMIN PANEL
        </h1>
        <p className="text-[10px] text-gray-500 font-bold tracking-tighter mt-1">FITFORGE AI CORE</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2 px-4">System Control</p>
        {adminNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-semibold text-sm">{item.name}</span>
          </NavLink>
        ))}

        <div className="mt-8 pt-8 border-t border-white/5">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Main Dashboard</span>
            </NavLink>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Security Status</span>
            </div>
            <p className="text-[9px] text-gray-500 leading-tight">Admin mode active. Actions are being logged for security auditing.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full rounded-lg transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold text-sm">Terminate Session</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
