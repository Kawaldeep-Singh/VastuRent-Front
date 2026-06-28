import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);
    if (result.success) navigate('/');
    else setError(result.error || "Incorrect login credentials.");
  };

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/[0.07] rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/[0.03] rounded-full blur-[150px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 animate-scale-in">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white shadow-glow-violet">
              <Building2 size={28} strokeWidth={2} />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/20 to-cyan-400/20 rounded-3xl blur-xl -z-10 animate-glow-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-display gradient-text">
            VASTU RENTALS
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium flex items-center gap-1.5">
            <Sparkles size={14} className="text-violet-400" />
            AI-Powered Property Matching
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl shadow-glass gradient-border">
          <h3 className="text-lg font-bold text-slate-100 mb-6 font-display">
            Agent Sign In
          </h3>

          {error && (
            <div className="mb-5 flex items-center gap-2 bg-rose-500/[0.08] border border-rose-500/[0.15] text-rose-400 text-sm px-4 py-3 rounded-xl animate-slide-up">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter broker username"
                  className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-slate-100 placeholder-slate-600 font-medium text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-slate-100 placeholder-slate-600 font-medium text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-2 mt-2 text-sm uppercase tracking-wider btn-shimmer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] block">
              Demo Credentials
            </span>
            <div className="mt-2 bg-[#0a0e1a]/60 py-2.5 px-4 rounded-xl border border-white/[0.04] text-xs text-slate-400 font-mono inline-block">
              User: <span className="text-violet-400 font-semibold">admin</span> &nbsp;|&nbsp; Pass: <span className="text-violet-400 font-semibold">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
