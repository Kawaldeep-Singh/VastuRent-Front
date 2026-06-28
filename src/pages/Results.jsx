import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, Copy, Check, AlertTriangle, Sparkles, MapPin, Phone,
  ChevronDown, ChevronUp, MessageSquare, IndianRupee, Home, SlidersHorizontal
} from 'lucide-react';

function formatPrice(value) {
  const amount = Number(value || 0);
  return amount ? `Rs ${amount.toLocaleString('en-IN')}` : 'Rent missing';
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? 'bg-teal-500/15 text-teal-300 border-teal-500/25'
    : score >= 70 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
    : score >= 55 ? 'bg-amber-500/15 text-amber-300 border-amber-500/20'
    : 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${color}`}>
      <Sparkles size={11} />
      {score}%
    </span>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawRequirement = location.state?.rawRequirement || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState({ 0: true });
  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    if (!rawRequirement) { navigate('/search'); return; }
    runMatch();
  }, []);

  const runMatch = async () => {
    try {
      setLoading(true);
      setError('');
      const settingsRes = await api.get('/settings');
      const { brokerName, agencyName } = settingsRes.data.settings || {};
      const res = await api.post('/match', { rawText: rawRequirement, brokerName, agencyName });
      if (res.data?.success) {
        setData(res.data);
        setMessage(res.data.whatsappMessage || '');
      } else {
        setError('Matching failed. Please try again.');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Backend connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      <p className="text-slate-300 font-bold text-sm">AI owner sheet se matching kar raha hai...</p>
      <p className="text-slate-600 text-xs">Project, sector, BHK, rent aur furnishing score ho rahe hain</p>
    </div>
  );

  if (error) return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full"><AlertTriangle size={32} /></div>
      <h3 className="text-lg font-bold text-slate-100">Something went wrong</h3>
      <p className="text-slate-400 text-sm max-w-md">{error}</p>
      <button onClick={() => navigate('/search')} className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-5 py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors">
        <ArrowLeft size={15} /> Try Again
      </button>
    </div>
  );

  const { requirement, matches = [], insights, isDuplicate, totalMatchesCount } = data;
  const topScore = matches[0]?.matchScore || 0;

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 space-y-6 w-full animate-fade-in">
        <header className="sticky top-0 z-20 bg-[#06090f]/92 backdrop-blur-xl border-b border-white/[0.06] -mx-4 px-4 py-4 md:static md:bg-transparent md:border-none md:p-0">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => navigate('/search')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              <ArrowLeft size={15} /> New Search
            </button>
            <button
              onClick={() => setShowMessage(!showMessage)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <MessageSquare size={15} />
              {showMessage ? 'Hide Message' : 'WhatsApp Message'}
            </button>
          </div>
        </header>

          {isDuplicate && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-xl text-sm font-medium">
              <AlertTriangle size={16} className="flex-shrink-0" />
              Same requirement searched recently. Client duplicate ho sakta hai, confirm kar lena.
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Requirement</p>
                  <h1 className="text-xl font-extrabold text-slate-100 mt-1">{requirement.summary || 'Rental requirement'}</h1>
                </div>
                <ScoreBadge score={topScore} />
              </div>
              <p className="text-sm text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">{rawRequirement}</p>
              <div className="flex flex-wrap gap-2">
                {requirement.projectName && <Chip label={requirement.projectName} color="teal" />}
                {requirement.bhk && <Chip label={`${requirement.bhk} BHK`} />}
                {requirement.sector && <Chip label={`Sector ${requirement.sector}`} color="teal" />}
                {requirement.budget && <Chip label={`${formatPrice(requirement.budget)} budget`} color="teal" />}
                {requirement.furnishing && <Chip label={requirement.furnishing} />}
                {requirement.tenantType && <Chip label={requirement.tenantType} />}
                {requirement.propertyType && <Chip label={requirement.propertyType} />}
              </div>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              <Metric icon={<Home size={16} />} label="Shown" value={matches.length} />
              <Metric icon={<SlidersHorizontal size={16} />} label="Total Matches" value={totalMatchesCount ?? matches.length} />
              <Metric icon={<IndianRupee size={16} />} label="Best Score" value={`${topScore}%`} />
            </div>
          </section>

          {showMessage && (
            <section className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Client WhatsApp Message</p>
                <button
                  onClick={copyMessage}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                >
                  {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
                </button>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-y min-h-44 focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-xs text-slate-500">Owner name/contact yahan intentionally include nahi hota. Internal owner details cards me visible rahenge.</p>
            </section>
          )}

          {matches.length === 0 ? (
            <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-10 text-center space-y-2">
              <p className="font-bold text-slate-300">No strong property match found</p>
              <p className="text-sm text-slate-500">Budget, sector ya furnishing thoda flexible karke dobara search karo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((item, i) => {
                const p = item.property;
                const isOpen = !!expanded[i];
                const strong = Object.entries(item.breakdown || {}).filter(([, val]) => val.score >= 80).slice(0, 3);
                const weak = item.flags?.slice(0, 2) || [];
                return (
                  <article key={`${p.projectName}-${p.ownerContact}-${i}`} className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-teal-500/25' : 'border-slate-800 hover:border-slate-700'}`}>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                      <div className="space-y-3 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-teal-400 flex-shrink-0">
                            <Home size={18} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="font-extrabold text-slate-100 text-base truncate">{p.projectName || p.propertyName || 'Unnamed Property'}</h2>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 flex-wrap">
                              <MapPin size={11} /> Sector {p.sector || 'N/A'} <span>•</span> {p.bhk || 'N/A'} BHK <span>•</span> {p.furnishing || 'Furnishing N/A'}
                            </p>
                            {p.sheetName && <span className="inline-block mt-2 text-xxs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 px-2 py-0.5 rounded-md">{p.sheetName}</span>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {strong.map(([key, val]) => <Chip key={key} label={`${key}: ${val.explanation}`} color="teal" />)}
                          {weak.map((flag) => <Chip key={flag} label={flag} color="amber" />)}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-end justify-between gap-2">
                        <ScoreBadge score={item.matchScore} />
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-teal-300">{formatPrice(p.rent)}</p>
                          <p className="text-xxs text-slate-600 font-semibold">per month</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [i]: !isOpen }))}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-slate-800 text-xxs text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-colors font-bold uppercase tracking-wider"
                    >
                      {isOpen ? <><ChevronUp size={12} /> Hide Details</> : <><ChevronDown size={12} /> View Owner And Score</>}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 space-y-3 bg-slate-950/30">
                        {item.explanation && (
                          <p className="text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl p-3 leading-relaxed">
                            <span className="text-teal-300 font-bold">AI note: </span>{item.explanation}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(item.breakdown || {}).map(([key, val]) => (
                            <div key={key} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xxs text-slate-500 uppercase font-bold tracking-wide capitalize">{key}</p>
                                <span className="text-xxs text-slate-400 font-bold">{val.score}%</span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1">{val.explanation}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Info label="Area / Floor" value={`${p.area || 'Area N/A'}${p.floor ? `, ${p.floor} floor` : ''}`} />
                          <Info label="Notes" value={p.additionalNotes || 'No notes in sheet'} />
                        </div>
                        {p.ownerName || p.ownerContact ? (
                          <div className="flex items-center justify-between gap-3 bg-amber-500/5 border border-amber-500/15 px-3 py-2.5 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone size={14} className="text-amber-300 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xxs text-amber-300 font-bold uppercase tracking-wide">Owner Contact - Internal Only</p>
                                <p className="text-xs text-slate-300 font-semibold truncate">{p.ownerName || 'Owner'} - {p.ownerContact || 'No contact'}</p>
                              </div>
                            </div>
                            {p.ownerContact && (
                              <a href={`tel:${p.ownerContact}`} className="text-xs font-bold text-slate-950 bg-amber-300 hover:bg-amber-200 px-3 py-2 rounded-lg transition-colors">Call</a>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {insights && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Market Insight</p>
              <p className="text-sm text-slate-300 leading-relaxed">{insights.budgetAnalysis}</p>
              {insights.nearbySectorAnalysis && <p className="text-xs text-slate-500 leading-relaxed">{insights.nearbySectorAnalysis}</p>}
              {insights.agentTips?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {insights.agentTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-24 flex flex-col justify-between">
      <div className="text-teal-400">{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
      <p className="text-xxs text-slate-500 uppercase font-bold tracking-wide">{label}</p>
      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{value}</p>
    </div>
  );
}

function Chip({ label, color = 'default' }) {
  const cls = color === 'teal'
    ? 'bg-teal-500/10 text-teal-300 border-teal-500/15'
    : color === 'amber'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/15'
      : 'bg-slate-800 text-slate-300 border-slate-700';
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border max-w-full ${cls}`}>{label}</span>;
}
