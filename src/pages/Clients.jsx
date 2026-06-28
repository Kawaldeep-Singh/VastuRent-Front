import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, RefreshCw, Check, X, Users, AlertCircle, Filter, Pencil, Trash2, GitMerge, ChevronRight } from 'lucide-react';

/* ── helpers ──────────────────────────────────────────────────── */
const fmtBudget = (v) => v ? 'Rs ' + Number(v).toLocaleString('en-IN') : '—';

function Badge({ text, color }) {
  const map = {
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    cyan:   'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    green:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    rose:   'bg-rose-500/10 text-rose-300 border-rose-500/20',
    amber:  'bg-amber-500/10 text-amber-300 border-amber-500/20',
    slate:  'bg-white/5 text-slate-400 border-white/10',
  };
  return (
    <span className={'inline-block border text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ' + (map[color] || map.slate)}>
      {text}
    </span>
  );
}

const COLS = [
  { key: 'name',       label: 'Name',         w: 150 },
  { key: 'phone',      label: 'Phone',        w: 140 },
  { key: 'bhk',        label: 'BHK',          w: 60  },
  { key: 'budget',     label: 'Max Budget',   w: 120 },
  { key: 'sector',     label: 'Sector',       w: 100 },
  { key: 'furnishing', label: 'Furnishing',   w: 140 },
  { key: 'tenantType', label: 'Tenant Type',  w: 110 },
  { key: 'remarks',    label: 'Remarks',      w: 260 },
  { key: 'status',     label: 'Status',       w: 90  },
  { key: '_actions',   label: 'Actions',      w: 120 },
];

const ADD_FIELDS = [
  { name: 'name',       label: 'Client Name',     type: 'text',    placeholder: 'Rahul Sharma', required: true },
  { name: 'phone',      label: 'Phone',           type: 'text',    placeholder: '9876543210' },
  { name: 'bhk',        label: 'BHK Required',    type: 'select',  options: ['','1 RK','1','2','3','4','5'] },
  { name: 'budget',     label: 'Max Budget (Rs)', type: 'number',  placeholder: '20000' },
  { name: 'sector',     label: 'Sector',          type: 'text',    placeholder: '81 or 89' },
  { name: 'furnishing', label: 'Furnishing',      type: 'select',  options: ['','Fully Furnished','Semi Furnished','Unfurnished','Any'] },
  { name: 'tenantType', label: 'Tenant Type',     type: 'select',  options: ['','Family','Bachelor','Company','Any'] },
  { name: 'remarks',    label: 'Remarks',         type: 'textarea',placeholder: 'Parking must, near school, shifting in 2 weeks...' },
  { name: 'status',     label: 'Status',          type: 'select',  options: ['Active','Closed'] },
];

const EMPTY_FORM = { name:'', phone:'', bhk:'', budget:'', sector:'', furnishing:'', tenantType:'', remarks:'', status:'Active' };

const TH = { padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', background: '#0f1626', borderRight: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', userSelect: 'none' };
const TD = { padding: '5px 10px', borderRight: '1px solid rgba(255,255,255,0.04)', fontSize: 12, verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 };
const INPUT_BASE = { width: '100%', height: 34, padding: '0 10px', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' };

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [syncMsg, setSyncMsg]           = useState('');

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editRow, setEditRow]           = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [submitting, setSubmitting]     = useState(false);
  const [submitOk, setSubmitOk]         = useState('');

  const searchRef = useRef(null);

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); searchRef.current && searchRef.current.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true); setError('');
      const r = await api.get('/clients');
      if (r.data && r.data.success) setClients(r.data.clients);
    } catch (e) { setError('Could not load clients.'); }
    finally { setLoading(false); }
  };

  const handleInput = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Client name is required.'); return; }
    try {
      setSubmitting(true);
      const r = await api.post('/clients', form);
      if (r.data && r.data.success) {
        setSubmitOk('Client added!');
        setForm(EMPTY_FORM);
        await fetchClients();
        setTimeout(() => { setModalOpen(false); setSubmitOk(''); }, 1200);
      }
    } catch (e) { setError((e.response && e.response.data && e.response.data.error) || 'Failed to add.'); }
    finally { setSubmitting(false); }
  };

  const handleEditOpen = (c) => {
    setEditRow(c);
    setForm({ name: c.name || '', phone: c.phone || '', bhk: String(c.bhk || ''), budget: String(c.budget || ''), sector: c.sector || '', furnishing: c.furnishing || '', tenantType: c.tenantType || '', remarks: c.remarks || '', status: c.status || 'Active' });
    setError(''); setSubmitOk('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editRow) return;
    try {
      setSubmitting(true);
      const r = await api.put('/clients/' + editRow.sourceRow, form);
      if (r.data && r.data.success) {
        setSubmitOk('Updated!');
        await fetchClients();
        setTimeout(() => { setEditRow(null); setSubmitOk(''); }, 1000);
      }
    } catch (e) { setError((e.response && e.response.data && e.response.data.error) || 'Failed to update.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rowIndex) => {
    try { await api.delete('/clients/' + rowIndex); setConfirmDelete(null); await fetchClients(); }
    catch (e) { setError('Failed to delete.'); }
  };

  const handleMatchSingle = (c) => {
    const parts = [];
    if (c.bhk) {
      const b = String(c.bhk).toLowerCase();
      parts.push(b.includes('bhk') || b.includes('rk') ? c.bhk : `${c.bhk} BHK`);
    }
    if (c.sector) parts.push(`Sector ${c.sector}`);
    if (c.budget) parts.push(`budget ${c.budget}`);
    if (c.furnishing) parts.push(c.furnishing);
    if (c.tenantType) parts.push(`for ${c.tenantType}`);
    if (c.remarks) parts.push(c.remarks);
    
    const rawText = parts.join(', ');
    navigate('/results', { state: { rawRequirement: rawText, clientName: c.name } });
  };

  const filtered = clients.filter(c => {
    const s = search.toLowerCase();
    const ms = !s || (c.name||'').toLowerCase().includes(s) || (c.phone||'').includes(s) || (c.sector||'').toLowerCase().includes(s) || (c.remarks||'').toLowerCase().includes(s);
    const mst = !statusFilter || (c.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    return ms && mst;
  });

  const renderForm = (onSubmit, isEdit) => (
    <form onSubmit={onSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}><AlertCircle size={13} /> {error}</div>}
      {submitOk && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}><Check size={13} /> {submitOk}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {ADD_FIELDS.map(f => (
          <div key={f.name} style={{ gridColumn: f.type === 'textarea' ? 'span 2' : 'span 1' }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {f.label}{f.required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
            </label>
            {f.type === 'select' ? (
              <select name={f.name} value={form[f.name]} onChange={handleInput} style={{ ...INPUT_BASE, cursor: 'pointer' }}>
                {f.options.map(o => <option key={o} value={o}>{o || '— Any —'}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea name={f.name} value={form[f.name]} onChange={handleInput} placeholder={f.placeholder} rows={3} style={{ ...INPUT_BASE, height: 'auto', padding: '8px 10px', resize: 'none' }} />
            ) : (
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleInput} placeholder={f.placeholder} required={f.required} style={INPUT_BASE} />
            )}
          </div>
        ))}
      </div>
    </form>
  );

  const renderModal = (open, onClose, title, subtitle, iconEl, color, onSubmit, isEdit) => open && (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#090d16', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 6, background: `rgba(${color},0.1)`, borderRadius: 8, color: `rgb(${color})` }}>{iconEl}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', margin: 0 }}>{title}</p>
              <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}><X size={16} /></button>
        </div>
        {renderForm(onSubmit, isEdit)}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} disabled={submitting} style={{ height: 34, padding: '0 18px', fontSize: 12, fontWeight: 600, color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSubmit} disabled={submitting} style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, background: `rgb(${color})`, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {submitting ? 'Saving...' : isEdit ? <><Check size={13} /><span>Save Changes</span></> : <><Plus size={13} /><span>Add Client</span></>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      <main className="flex-1 flex flex-col w-full overflow-hidden relative">

        {/* ── Sticky Toolbar ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,12,23,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', minHeight: 36, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Users size={17} style={{ color: '#34d399' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>Clients</span>
              <span style={{ fontSize: 10, color: '#475569' }}>{loading ? 'loading...' : `${filtered.length} / ${clients.length} rows`}</span>
            </div>

            <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, sector, remarks...   Ctrl+F"
                style={{ width: '100%', height: 32, paddingLeft: 34, paddingRight: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}><X size={12} /></button>}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {syncMsg && <span style={{ fontSize: 10, color: '#34d399', fontWeight: 700, alignSelf: 'center' }}>{syncMsg}</span>}
              <button onClick={() => setShowFilters(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid', cursor: 'pointer', background: showFilters ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)', borderColor: showFilters ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)', color: showFilters ? '#34d399' : '#94a3b8' }}>
                <Filter size={12} />
              </button>
              <button onClick={fetchClients} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer' }}>
                <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Sync
              </button>
              <button onClick={() => navigate('/auto-match')} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', cursor: 'pointer' }}>
                <GitMerge size={13} /> Auto Match
              </button>
              <button onClick={() => { setModalOpen(true); setForm(EMPTY_FORM); setError(''); setSubmitOk(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#34d399', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, flexWrap: 'wrap' }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: 28, padding: '0 8px', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, color: '#cbd5e1', outline: 'none', cursor: 'pointer' }}>
                {[['','All Status'],['Active','Active'],['Closed','Closed']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {statusFilter && <button onClick={() => setStatusFilter('')} style={{ height: 28, padding: '0 10px', fontSize: 10, fontWeight: 700, color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.1)', borderRadius: 6, cursor: 'pointer' }}>Clear</button>}
            </div>
          )}
        </header>

        {error && !modalOpen && !editRow && (
          <div style={{ margin: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 16px', borderRadius: 8 }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* ── Table Container ── */}
        <div style={{ flex: 1, overflow: 'auto', background: '#080c16' }} className="custom-scrollbar">
          <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', textAlign: 'left' }}>
            <colgroup>
              <col style={{ width: 36 }} />
              {COLS.map(c => <col key={c.key} style={{ width: c.w }} />)}
            </colgroup>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ ...TH, width: 36, textAlign: 'center', color: '#334155' }}></th>
                {COLS.map(col => <th key={col.key} style={TH}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? '#07090f' : '#060810' }}>
                  <td style={{ ...TD, width: 36, textAlign: 'center' }}>{i + 1}</td>
                  {COLS.map(col => <td key={col.key} style={TD}><div className="skeleton" style={{ height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.07)', width: '70%' }} /></td>)}
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={COLS.length + 1} style={{ padding: '80px 0', textAlign: 'center', color: '#334155', fontSize: 12, fontWeight: 600 }}>No clients found. Add your first client with the green button above.</td></tr>
              )}
              {!loading && filtered.map((c, i) => {
                const isActive = (c.status || 'Active').toLowerCase() === 'active';
                const bg = i % 2 === 0 ? '#07090f' : '#060810';
                return (
                  <tr key={i} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = bg}>
                    <td style={{ ...TD, width: 36, textAlign: 'center', color: '#1e293b', fontSize: 10, userSelect: 'none' }}>{i + 1}</td>
                    <td style={{ ...TD, color: '#f1f5f9', fontWeight: 600 }} title={c.name}>{c.name || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}</td>
                    <td style={{ ...TD, color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>{c.phone || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {c.bhk ? <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{c.bhkRaw || c.bhk}</span> : <span style={{ color: '#1e293b' }}>&mdash;</span>}
                    </td>
                    <td style={{ ...TD, fontWeight: 700, color: '#22d3ee' }}>{c.budget ? fmtBudget(c.budget) : <span style={{ color: '#1e293b', fontWeight: 400, fontStyle: 'italic' }}>&mdash;</span>}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {c.sector ? <Badge text={'Sec ' + c.sector} color="violet" /> : <span style={{ color: '#1e293b' }}>&mdash;</span>}
                    </td>
                    <td style={TD}>{c.furnishing ? <Badge text={c.furnishing} color="cyan" /> : <span style={{ color: '#1e293b' }}>&mdash;</span>}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {c.tenantType ? <Badge text={c.tenantType} color={c.tenantType.toLowerCase() === 'family' ? 'green' : 'amber'} /> : <span style={{ color: '#1e293b' }}>&mdash;</span>}
                    </td>
                    <td style={{ ...TD, color: '#475569', fontSize: 11 }} title={c.remarks}>{c.remarks || <span style={{ color: '#0f172a', fontStyle: 'italic' }}>&mdash;</span>}</td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <Badge text={c.status || 'Active'} color={isActive ? 'green' : 'slate'} />
                    </td>
                    <td style={{ ...TD, textAlign: 'center', overflow: 'visible' }}>
                      {confirmDelete === c.sourceRow ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700, whiteSpace: 'nowrap' }}>Delete?</span>
                          <button onClick={() => handleDelete(c.sourceRow)} style={{ fontSize: 9, fontWeight: 800, color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>Yes</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>No</button>
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                          <button onClick={() => handleMatchSingle(c)} title="Run Match" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700 }}><GitMerge size={10} /> Match</button>
                          <button onClick={() => handleEditOpen(c)} title="Edit" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#818cf8' }}><Pencil size={11} /></button>
                          <button onClick={() => setConfirmDelete(c.sourceRow)} title="Delete" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#f87171' }}><Trash2 size={11} /></button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && clients.length > 0 && (
            <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', background: 'rgba(8,9,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155', fontWeight: 600 }}>
              <span>{filtered.length} clients shown of {clients.length} total</span>
              <span style={{ color: '#1e293b' }}>{clients.filter(c => (c.status || 'Active').toLowerCase() === 'active').length} active &nbsp;&middot;&nbsp; {clients.filter(c => (c.status || '').toLowerCase() === 'closed').length} closed</span>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {renderModal(modalOpen, () => setModalOpen(false), 'Add Client', 'Appends to Clients sheet', <Users size={15} />, '52,211,153', handleAdd, false)}

      {/* Edit Modal */}
      {renderModal(!!editRow, () => setEditRow(null), 'Edit Client', editRow ? `Row ${editRow.sourceRow} — ${editRow.name}` : '', <Pencil size={15} />, '129,140,248', handleUpdate, true)}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .skeleton { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
