import React from 'react';
import { Lock, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LockedFeature = ({ children, requiredPlan = 'PRO', title = 'Premium Feature' }) => {
  return (
    <div className="relative group">
      {/* Blurred Content */}
      <div className="filter blur-md pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] rounded-2xl border border-white/5 transition-all duration-300 group-hover:bg-slate-900/60">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500">
          {requiredPlan === 'ELITE' ? (
            <Crown className="w-8 h-8 text-purple-400 animate-pulse" />
          ) : (
            <Zap className="w-8 h-8 text-accent animate-pulse" />
          )}
        </div>

        <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-gray-400 text-sm text-center max-w-[200px] mb-8 leading-relaxed font-medium">
          Unlock this feature with a <span className={requiredPlan === 'ELITE' ? 'text-purple-400' : 'text-accent'}>{requiredPlan}</span> plan.
        </p>

        <Link 
          to="/subscription" 
          className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg ${
            requiredPlan === 'ELITE' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:shadow-purple-500/40' 
              : 'bg-accent text-slate-900 shadow-cyan-500/20 hover:shadow-cyan-500/40'
          }`}
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
};

export default LockedFeature;
