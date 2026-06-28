import React, { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { GitMerge, RefreshCw, AlertCircle, Users, Building2, ChevronRight, X, MessageSquare, Check, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── helpers ──────────────────────────────────────────────────── */
const fmtRent = (v) => v ? 'Rs ' + Number(v).toLocaleString('en-IN') : '—';

function ScoreBadge({ score }) {
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: `2px solid ${color}`, color, fontSize: 12, fontWeight: 900 }}>
      {score}
    </div>
  );
}

function buildWhatsAppMsg(property, clientName) {
  const lines = [
    `Hi${clientName ? ' ' + clientName : ''}! 🏠`,
    '',
    `We have a great option for you in *${property.projectName || property.sector}*:`,
    '',
    property.bhk ? `• *${property.bhkLabel || property.bhk} BHK* — ${property.furnishing || ''}` : null,
    property.sector ? `• *Sector ${property.sector}*` : null,
    property.rent ? `• *Rent: ${fmtRent(property.rent)}/month*` : null,
    property.additionalNotes ? `• ${property.additionalNotes}` : null,
    '',
    'Interested? Let me know and we can schedule a visit! 📍',
    '',
    `— Vastu Rentals`
  ].filter(l => l !== null);
  return lines.join('\n');
}

export default function AutoMatch() {
  const navigate = useNavigate();
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [ran, setRan]               = useState(false);
  const [error, setError]           = useState('');
  const [meta, setMeta]             = useState(null);
  const [expandedClient, setExpandedClient] = useState(null);
  const [copiedMsg, setCopiedMsg]   = useState('');

  const runMatch = useCallback(async () => {
    try {
      setLoading(true); setError(''); setRan(false);
      const r = await api.post('/clients/match-all');
      if (r.data && r.data.success) {
        setResults(r.data.results || []);
        setMeta({ totalClients: r.data.totalClients, totalProperties: r.data.totalProperties });
        setRan(true);
      }
    } catch (e) {
      setError('Auto-match failed. Make sure both sheets have data.');
    } finally { setLoading(false); }
  }, []);

  const copyMsg = (msg, key) => {
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedMsg(key); setTimeout(() => setCopiedMsg(''), 2000);
    });
  };

  const goToFullMatch = (client) => {
    const parts = [];
    if (client.bhk) {
      const b = String(client.bhk).toLowerCase();
      parts.push(b.includes('bhk') || b.includes('rk') ? client.bhk : `${client.bhk} BHK`);
    }
    if (client.sector) parts.push(`Sector ${client.sector}`);
    if (client.budget) parts.push(`budget ${client.budget}`);
    if (client.furnishing) parts.push(client.furnishing);
    if (client.tenantType) parts.push(`for ${client.tenantType}`);
    if (client.remarks) parts.push(client.remarks);

    const rawText = parts.join(', ');
    navigate('/results', { state: { rawRequirement: rawText, clientName: client.name } });
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      <main className="flex-1 flex flex-col w-full overflow-hidden relative">

        {/* ── Sticky Header ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,12,23,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 8, background: 'rgba(52,211,153,0.1)', borderRadius: 10, color: '#34d399' }}><GitMerge size={18} /></div>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9', margin: 0 }}>Auto Match</h1>
                <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>Active clients vs inventory</p>
              </div>
            </div>
            <button onClick={runMatch} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', fontSize: 12, fontWeight: 700, borderRadius: 10, background: loading ? 'rgba(52,211,153,0.15)' : '#34d399', color: loading ? '#34d399' : '#0a0e1a', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? '...' : 'Run'}
            </button>
          </div>
        </header>

        {/* Error */}
        {error && <div style={{ margin: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 16px', borderRadius: 8 }}><AlertCircle size={13} /> {error}</div>}

        {/* Empty / Initial state */}
        {!loading && !ran && !error && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 }}>
            <div style={{ padding: 24, background: 'rgba(52,211,153,0.06)', borderRadius: '50%', border: '1px solid rgba(52,211,153,0.12)' }}><GitMerge size={48} style={{ color: 'rgba(52,211,153,0.4)' }} /></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', margin: 0 }}>Start Matching</p>
            </div>
            <button onClick={runMatch} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 28px', fontSize: 14, fontWeight: 700, borderRadius: 12, background: '#34d399', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}>
              <Zap size={16} /> Run Auto Match
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }} className="skeleton" />
            ))}
          </div>
        )}

        {/* Results */}
        {ran && !loading && (
          <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }} className="custom-scrollbar">
            {results.length === 0 && (
              <div style={{ textAlign: 'center', color: '#334155', padding: '60px 0' }}>
                <Users size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>No active clients found</p>
              </div>
            )}
            {results.map((r, idx) => {
              const isExpanded = expandedClient === idx;
              const hasMatches = r.matches && r.matches.length > 0;
              return (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {/* Client row header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', background: isExpanded ? 'rgba(52,211,153,0.04)' : 'transparent' }} onClick={() => setExpandedClient(isExpanded ? null : idx)}>
                    {/* Avatar */}
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: hasMatches ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${hasMatches ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                      <Users size={16} style={{ color: hasMatches ? '#34d399' : '#475569' }} />
                    </div>

                    {/* Client info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{r.client.name || 'Unnamed Client'}</span>
                        {r.client.phone && <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>{r.client.phone}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                        {r.client.bhk ? <span style={{ fontSize: 10, color: '#94a3b8' }}>{r.client.bhkRaw || r.client.bhk} BHK</span> : null}
                        {r.client.sector ? <span style={{ fontSize: 10, color: '#64748b' }}>Sec {r.client.sector}</span> : null}
                        {r.client.budget ? <span style={{ fontSize: 10, color: '#22d3ee', fontWeight: 700 }}>≤ {fmtRent(r.client.budget)}</span> : null}
                        {r.client.furnishing ? <span style={{ fontSize: 10, color: '#a78bfa' }}>{r.client.furnishing}</span> : null}
                        {r.client.tenantType ? <span style={{ fontSize: 10, color: '#fbbf24' }}>{r.client.tenantType}</span> : null}
                      </div>
                    </div>

                    {/* Match count + expand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: hasMatches ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)', color: hasMatches ? '#34d399' : '#475569', border: `1px solid ${hasMatches ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                        {r.matchCount} match{r.matchCount !== 1 ? 'es' : ''}
                      </span>
                      <button onClick={e => { e.stopPropagation(); goToFullMatch(r.client); }} style={{ fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8', cursor: 'pointer' }}>
                        <TrendingUp size={10} /> Full AI Match
                      </button>
                      <ChevronRight size={14} style={{ color: '#475569', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>

                  {/* Expanded: match cards */}
                  {isExpanded && (
                    <div style={{ padding: '4px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {!hasMatches && (
                        <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: '#334155' }}>
                          No matching properties found for this client. Try relaxing the budget or sector.
                          {r.nearMisses && r.nearMisses.length > 0 && <span style={{ color: '#64748b' }}> ({r.nearMisses.length} near miss{r.nearMisses.length !== 1 ? 'es' : ''})</span>}
                        </div>
                      )}
                      {hasMatches && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                          {r.matches.map((m, mi) => {
                            const msgKey = `${idx}-${mi}`;
                            const msg = buildWhatsAppMsg(m, r.client.name);
                            return (
                              <div key={mi} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <ScoreBadge score={Math.round(m.matchScore)} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{m.projectName}</span>
                                    {m.sector && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>Sec {m.sector}</span>}
                                    {m.bhk ? <span style={{ fontSize: 10, color: '#94a3b8' }}>{m.bhkLabel || m.bhk} BHK</span> : null}
                                  </div>
                                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11 }}>
                                    {m.rent ? <span style={{ color: '#22d3ee', fontWeight: 700 }}>{fmtRent(m.rent)}/mo</span> : null}
                                    {m.furnishing ? <span style={{ color: '#64748b' }}>{m.furnishing}</span> : null}
                                    {m.propertyName ? <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 10 }}>{m.propertyName}</span> : null}
                                  </div>
                                  {m.additionalNotes && <p style={{ margin: '4px 0 0', fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.additionalNotes}</p>}
                                </div>
                                <button
                                  onClick={() => copyMsg(msg, msgKey)}
                                  title="Copy WhatsApp Message (no owner details)"
                                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', fontSize: 11, fontWeight: 700, borderRadius: 7, cursor: 'pointer', transition: 'all 0.2s', background: copiedMsg === msgKey ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.08)', border: `1px solid ${copiedMsg === msgKey ? 'rgba(52,211,153,0.4)' : 'rgba(52,211,153,0.15)'}`, color: copiedMsg === msgKey ? '#34d399' : '#34d399' }}>
                                  {copiedMsg === msgKey ? <><Check size={11} /> Copied!</> : <><MessageSquare size={11} /> Copy Msg</>}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {r.nearMisses && r.nearMisses.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Near Misses</p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {r.nearMisses.map((nm, ni) => (
                              <div key={ni} style={{ fontSize: 10, color: '#475569', padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {nm.projectName} <span style={{ color: '#334155' }}>({Math.round(nm.matchScore)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .skeleton { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
