import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Database, 
  Search, 
  Settings, 
  LogOut, 
  Building2,
  Zap,
  Users,
  GitMerge,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard',  path: '/',           icon: Home },
    { name: 'Inventory',  path: '/inventory',  icon: Database },
    { name: 'Clients',    path: '/clients',    icon: Users },
    { name: 'Auto Match', path: '/auto-match', icon: GitMerge },
    { name: 'AI Match',   path: '/search',     icon: Search },
    { name: 'Settings',   path: '/settings',   icon: Settings },
  ];

  return (
    <aside className={`w-64 bg-[#0a0e1a]/95 backdrop-blur-xl border-r border-white/[0.04] flex flex-col h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Logo */}
      <div className="p-6 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white shadow-glow-violet">
              <Building2 size={20} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0e1a]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide font-display gradient-text">
              VASTU
            </h1>
            <span className="text-[10px] block text-slate-500 font-bold tracking-[0.2em] uppercase -mt-0.5">
              Rentals AI
            </span>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-white/[0.03] rounded-lg border border-white/[0.08]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/[0.12] to-cyan-500/[0.06] text-violet-300'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400" />
                  )}
                  <Icon
                    size={19}
                    className={`transition-all duration-300 ${isActive ? 'text-violet-400' : 'group-hover:text-violet-300'}`}
                  />
                  <span className="text-sm font-semibold">{link.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status */}
      <div className="px-4 py-4 border-t border-white/[0.04] space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-emerald-500/[0.08] px-3 py-2 rounded-lg border border-emerald-500/[0.08]">
          <Zap size={12} className="animate-glow-pulse" />
          <span>AI Engine Active</span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all duration-300 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
