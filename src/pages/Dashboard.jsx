import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Database, ArrowRight, Building2, CheckCircle, AlertCircle, Sparkles, TrendingUp, Layers } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [quickText, setQuickText] = useState('');
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/inventory').then(r => setStats(r.data)).catch(() => {});
    api.get('/settings').then(r => setSettings(r.data.settings || {})).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    navigate('/results', { state: { rawRequirement: quickText } });
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar w-full">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Welcome */}
          <div className="pt-2">
            <h1 className="text-3xl font-extrabold text-slate-100 font-display">
              Welcome, <span className="gradient-text">{settings.brokerName || 'Broker'}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">{settings.agencyName || 'Vastu Rentals'} — AI Property Matching Dashboard</p>
          </div>

          {/* System Status */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            settings.mockMode
              ? 'bg-amber-500/[0.06] border-amber-500/[0.12] text-amber-400'
              : 'bg-emerald-500/[0.06] border-emerald-500/[0.12] text-emerald-400'
          }`}>
            {settings.mockMode
              ? <><AlertCircle size={15} /> Running in Mock Mode — Connect Google Sheet in Settings for live data.</>
              : <><CheckCircle size={15} /> Google Sheets Connected — Live inventory sync active.</>
            }
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Layers size={18} />}
                label="Total Listings"
                value={stats.count}
                color="violet"
              />
              <StatCard
                icon={<Building2 size={18} />}
                label="Available Now"
                value={stats.availableCount}
                color="cyan"
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="Rented Properties"
                value={stats.rentedCount || 0}
                color="emerald"
              />
            </div>
          )}

          {/* Quick Match Box */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                <Sparkles size={16} className="text-violet-400" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 font-display">Quick AI Match</h2>
                <p className="text-[11px] text-slate-500">Paste client message → AI finds best properties</p>
              </div>
            </div>
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder='e.g. "3 BHK semi furnished Sector 89 under 30k"'
                className="flex-1 glass-input rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 font-medium"
              />
              <button
                type="submit"
                disabled={!quickText.trim()}
                className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold px-6 rounded-xl transition-all flex items-center gap-1.5 text-sm flex-shrink-0 btn-shimmer"
              >
                Match <ArrowRight size={15} />
              </button>
            </form>
            <p className="text-xs text-slate-600">
              Ya <button onClick={() => navigate('/search')} className="text-violet-400 hover:text-violet-300 transition-colors">full search page</button> use karo for detailed input
            </p>
          </div>

          {/* Action Shortcuts */}
          <div className="grid grid-cols-2 gap-4">
            <ActionCard
              icon={<Database size={18} />}
              title="Property Inventory"
              subtitle="View & add listings"
              color="violet"
              onClick={() => navigate('/inventory')}
            />
            <ActionCard
              icon={<Search size={18} />}
              title="Match Requirement"
              subtitle="Paste WhatsApp message"
              color="cyan"
              onClick={() => navigate('/search')}
            />
          </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    violet: 'from-violet-500/15 to-violet-500/5 text-violet-400 border-violet-500/10',
    cyan: 'from-cyan-500/15 to-cyan-500/5 text-cyan-400 border-cyan-500/10',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/10',
  };
  return (
    <div className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colors[color]}`}>
      <div className="mb-3 opacity-60">{icon}</div>
      <p className="text-3xl font-extrabold text-slate-100 font-display">{value}</p>
      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, color, onClick }) {
  const iconColors = {
    violet: 'from-violet-500/15 to-violet-500/5 text-violet-400',
    cyan: 'from-cyan-500/15 to-cyan-500/5 text-cyan-400',
  };
  return (
    <button
      onClick={onClick}
      className="glass-card flex items-center justify-between rounded-2xl p-5 text-left group transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 bg-gradient-to-br ${iconColors[color]} rounded-xl`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-slate-200 text-sm">{title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ArrowRight size={16} className="text-slate-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
