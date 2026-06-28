import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

export default function Navbar({ title = "Dashboard" }) {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    mockMode: true,
    brokerName: "Kawal",
    agencyName: "Vastu Rentals"
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data && response.data.settings) {
        setConfig(response.data.settings);
      }
    } catch (err) {
      console.warn("Failed to load settings in Navbar:", err.message);
    }
  };

  const getFormattedDate = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <header className="h-16 bg-[#0a0e1a]/60 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-100 font-display tracking-wide">
          {title}
        </h1>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <Calendar size={11} className="text-violet-400" />
          <span>{getFormattedDate()}</span>
        </p>
      </div>

      {/* Right: Status + Profile */}
      <div className="flex items-center gap-5">
        {/* Status Badge */}
        {config.mockMode ? (
          <div className="flex items-center gap-1.5 bg-amber-500/[0.08] border border-amber-500/[0.12] text-amber-400 text-[11px] px-3 py-1.5 rounded-full font-semibold">
            <AlertTriangle size={12} className="animate-pulse" />
            <span>Mock Mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-500/[0.08] border border-emerald-500/[0.12] text-emerald-400 text-[11px] px-3 py-1.5 rounded-full font-semibold">
            <CheckCircle size={12} />
            <span>Sheets Connected</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-200">
              {config.brokerName}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {config.agencyName}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm">
            {config.brokerName ? config.brokerName.charAt(0).toUpperCase() : 'B'}
          </div>
        </div>
      </div>
    </header>
  );
}
