import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Plus, Search, RefreshCw, Check, X, Building2, AlertCircle, Layers, Filter, FileSpreadsheet, Pencil, Trash2 } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────── */
const fmtRent = (v) => v ? 'Rs ' + Number(v).toLocaleString('en-IN') : '\u2014';

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

const furnishColor = (f) => {
  const v = (f || '').toLowerCase();
  if (v.includes('fully'))  return 'green';
  if (v.includes('semi'))   return 'cyan';
  if (v.includes('unfurn')) return 'amber';
  return 'slate';
};

/* ── Column config (Google Sheet order) ───────────────────────── */
const COLS = [
  { key: 'ownerName',       label: 'Name',         w: 140 },
  { key: 'ownerContact',    label: 'Phone',        w: 140 },
  { key: 'furnishing',      label: 'Furnishing',   w: 130 },
  { key: 'bhk',             label: 'BHK',          w: 60  },
  { key: 'rent',            label: 'Rent',         w: 110 },
  { key: 'propertyName',    label: 'Unit',         w: 130 },
  { key: 'projectName',     label: 'Society Name', w: 200 },
  { key: 'sector',          label: 'Sector',       w: 90  },
  { key: 'additionalNotes', label: 'Remarks',      w: 280 },
  { key: 'availability',    label: 'Status',       w: 90  },
  { key: '_actions',        label: 'Actions',      w: 90  },
];

const ADD_FIELDS = [
  { name: 'ownerName',       label: 'Name',              type: 'text',     placeholder: 'Owner name' },
  { name: 'ownerContact',    label: 'Phone',             type: 'text',     placeholder: '+91 99999 11111' },
  { name: 'furnishing',      label: 'Furnishing Status', type: 'select',   options: ['Fully Furnished','Semi Furnished','Unfurnished','Raw'] },
  { name: 'bhk',             label: 'BHK',               type: 'select',   options: ['1 RK','1','2','3','4','5'] },
  { name: 'rent',            label: 'Rent',              type: 'number',   placeholder: '16500', required: true },
  { name: 'propertyName',    label: 'Unit',              type: 'text',     placeholder: 'Tower / unit / flat no.' },
  { name: 'projectName',     label: 'Society Name',      type: 'text',     placeholder: 'GLS Avenue 81', required: true },
  { name: 'sector',          label: 'Sector',            type: 'text',     placeholder: 'Sector 81', required: true },
  { name: 'additionalNotes', label: 'Remarks',           type: 'textarea', placeholder: 'Keys, family/bachelor, facing...' },
];

const EMPTY_FORM = { ownerName:'', ownerContact:'', furnishing:'Semi Furnished', bhk:'2', rent:'', propertyName:'', projectName:'', sector:'', additionalNotes:'' };

/* ── inline style objects ─────────────────────────────────────── */
const TH = {
  padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b',
  background: '#0f1626', borderRight: '1px solid rgba(255,255,255,0.05)',
  whiteSpace: 'nowrap', userSelect: 'none',
};
const TD = {
  padding: '5px 10px', borderRight: '1px solid rgba(255,255,255,0.04)',
  fontSize: 12, verticalAlign: 'middle',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0,
};
const INPUT_BASE = {
  width: '100%', height: 34, padding: '0 10px',
  background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none', boxSizing: 'border-box',
};

/* ── Main component ───────────────────────────────────────────── */
export default function Inventory() {
  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [syncMsg, setSyncMsg]           = useState('');

  const [search, setSearch]             = useState('');
  const [bhkFilter, setBhkFilter]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Available');
  const [sectorFilter, setSectorFilter] = useState('');
  const [furnFilter, setFurnFilter]     = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editRow, setEditRow]           = useState(null);  // property being edited
  const [confirmDelete, setConfirmDelete] = useState(null); // rowIndex to confirm delete
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [submitting, setSubmitting]     = useState(false);
  const [submitOk, setSubmitOk]         = useState('');

  const searchRef = useRef(null);

  useEffect(() => { fetchListings(); }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchRef.current && searchRef.current.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true); setError('');
      const r = await api.get('/inventory');
      if (r.data && r.data.success) setListings(r.data.listings);
    } catch (e) { setError('Could not load inventory.'); }
    finally { setLoading(false); }
  };

  const forceRefresh = async () => {
    try {
      setRefreshing(true); setSyncMsg(''); setError('');
      const r = await api.post('/inventory/refresh');
      if (r.data && r.data.success) {
        setSyncMsg('Synced ' + r.data.count + ' records');
        await fetchListings();
        setTimeout(() => setSyncMsg(''), 3500);
      }
    } catch (e) { setError('Refresh failed.'); }
    finally { setRefreshing(false); }
  };

  const handleInput = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.projectName.trim() || !form.sector.trim() || !form.rent) {
      setError('Society Name, Sector and Rent are required.'); return;
    }
    try {
      setSubmitting(true);
      const r = await api.post('/inventory', form);
      if (r.data && r.data.success) {
        setSubmitOk('Property added!');
        setForm(EMPTY_FORM);
        await fetchListings();
        setTimeout(() => { setModalOpen(false); setSubmitOk(''); }, 1200);
      }
    } catch (e) {
      setError((e.response && e.response.data && e.response.data.error) || 'Failed to add.');
    } finally { setSubmitting(false); }
  };

  // Open edit modal pre-filled with existing property data
  const handleEditOpen = (p) => {
    setEditRow(p);
    setForm({
      ownerName:       p.ownerName       || '',
      ownerContact:    p.ownerContact     || '',
      furnishing:      p.furnishing       || 'Semi Furnished',
      bhk:             String(p.bhk      || '2'),
      rent:            String(p.rent     || ''),
      propertyName:    p.propertyName    || '',
      projectName:     p.projectName     || '',
      sector:          p.sector          || '',
      additionalNotes: p.additionalNotes || '',
    });
    setError(''); setSubmitOk('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editRow) return;
    try {
      setSubmitting(true);
      const r = await api.put('/inventory/' + editRow.sourceRow, form);
      if (r.data && r.data.success) {
        setSubmitOk('Updated!');
        await fetchListings();
        setTimeout(() => { setEditRow(null); setSubmitOk(''); }, 1000);
      }
    } catch (e) {
      setError((e.response && e.response.data && e.response.data.error) || 'Failed to update.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (rowIndex) => {
    try {
      await api.delete('/inventory/' + rowIndex);
      setConfirmDelete(null);
      await fetchListings();
    } catch (e) {
      setError('Failed to delete.');
    }
  };

  const filtered = listings.filter(p => {
    const s = search.toLowerCase();
    const ms = !s ||
      (p.projectName||'').toLowerCase().includes(s) ||
      (p.propertyName||'').toLowerCase().includes(s) ||
      (p.ownerName||'').toLowerCase().includes(s) ||
      (p.ownerContact||'').includes(s) ||
      (p.additionalNotes||'').toLowerCase().includes(s) ||
      (p.sector||'').toLowerCase().includes(s);
    const mb  = !bhkFilter    || String(p.bhk) === bhkFilter;
    const mst = !statusFilter || (p.availability||'').toLowerCase() === statusFilter.toLowerCase();
    const msc = !sectorFilter || (p.sector||'').toLowerCase().includes(sectorFilter.toLowerCase());
    const mf  = !furnFilter   || (p.furnishing||'').toLowerCase().includes(furnFilter.toLowerCase());
    return ms && mb && mst && msc && mf;
  });

  const activeCount = [bhkFilter, sectorFilter, furnFilter, statusFilter !== 'Available' ? statusFilter : ''].filter(Boolean).length;

  const filterDefs = [
    { val: statusFilter, set: setStatusFilter, opts: [['','All Status'],['Available','Available'],['Rented','Rented']] },
    { val: bhkFilter,    set: setBhkFilter,    opts: [['','All BHK'],['0','1 RK'],['1','1 BHK'],['2','2 BHK'],['3','3 BHK'],['4','4 BHK']] },
    { val: furnFilter,   set: setFurnFilter,   opts: [['','All Furnishing'],['Fully','Fully Furnished'],['Semi','Semi Furnished'],['Unfurnished','Unfurnished']] },
  ];

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      <main className="flex-1 flex flex-col w-full overflow-hidden relative">

        {/* ═══ Sticky Toolbar ═══════════════════════════════════ */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,12,23,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px' }}>

          {/* Row 1: title + search + actions */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, minHeight: 36 }}>

            {/* Title block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <FileSpreadsheet size={17} style={{ color: '#818cf8' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>Inventory</span>
              <span style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>
                {loading ? 'loading...' : `${filtered.length} / ${listings.length} rows`}
              </span>
              {!loading && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Layers size={9} /> Google Sync
                </span>
              )}
            </div>

            {/* Search bar — fixed in navbar */}
            <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, society, sector, remarks...   Ctrl+F"
                style={{ width: '100%', height: 32, paddingLeft: 34, paddingRight: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={forceRefresh} disabled={loading || refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer' }}>
                <RefreshCw size={12} style={{ animation: (loading || refreshing) ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Syncing...' : 'Sync'}
              </button>
              
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(p => !p)}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', background: showFilters ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', borderColor: showFilters ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)', color: showFilters ? '#a78bfa' : '#94a3b8' }}>
                <Filter size={12} />
                {activeCount > 0 && (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#7c3aed', fontSize: 9, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Add Row */}
              <button
                onClick={() => { setModalOpen(true); setError(''); setSubmitOk(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {/* Row 2: Collapsible filters */}
          {showFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, flexWrap: 'wrap' }}>
              {filterDefs.map((f, i) => (
                <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ height: 28, padding: '0 8px', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, color: '#cbd5e1', outline: 'none', cursor: 'pointer' }}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ))}
              <input
                type="text" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
                placeholder="Sector..."
                style={{ height: 28, width: 80, padding: '0 8px', background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, color: '#cbd5e1', outline: 'none' }}
              />
              {activeCount > 0 && (
                <button
                  onClick={() => { setBhkFilter(''); setStatusFilter(''); setSectorFilter(''); setFurnFilter(''); }}
                  style={{ height: 28, padding: '0 10px', fontSize: 10, fontWeight: 700, color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.1)', borderRadius: 6, cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>
          )}
        </header>

        {/* Error banner */}
        {error && !modalOpen && (
          <div style={{ margin: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 16px', borderRadius: 8 }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* ═══ Spreadsheet Table ═════════════════════════════════ */}
        <div style={{ flex: 1, overflow: 'auto', background: '#080c16' }} className="custom-scrollbar">
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1300, tableLayout: 'fixed' }}>
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
              {/* Skeleton loading */}
              {loading && Array.from({ length: 14 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? '#07090f' : '#060810' }}>
                  <td style={{ ...TD, width: 36, textAlign: 'center', color: '#1e293b', fontSize: 10 }}>{i + 1}</td>
                  {COLS.map(col => (
                    <td key={col.key} style={TD}>
                      <div className="skeleton" style={{ height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.07)', width: '70%' }} />
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length + 1} style={{ padding: '80px 0', textAlign: 'center', color: '#334155', fontSize: 12, fontWeight: 600 }}>
                    No rows match. Adjust search or clear filters.
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && filtered.map((p, i) => {
                const isAvail = (p.availability || '').toLowerCase() === 'available';
                const bg = i % 2 === 0 ? '#07090f' : '#060810';
                return (
                  <tr
                    key={i}
                    style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = bg}
                  >
                    {/* Row # */}
                    <td style={{ ...TD, width: 36, textAlign: 'center', color: '#1e293b', fontSize: 10, userSelect: 'none' }}>{i + 1}</td>

                    {/* Name */}
                    <td style={{ ...TD, color: '#cbd5e1', fontWeight: 500 }} title={p.ownerName}>
                      {p.ownerName || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Phone */}
                    <td style={{ ...TD, color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>
                      {p.ownerContact || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Furnishing */}
                    <td style={TD}>
                      {p.furnishingRaw
                        ? <Badge text={p.furnishing} color={furnishColor(p.furnishing)} />
                        : <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* BHK */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {p.bhk
                        ? <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{p.bhkLabel || p.bhk}</span>
                        : <span style={{ color: '#1e293b' }}>&mdash;</span>}
                    </td>

                    {/* Rent */}
                    <td style={{ ...TD, fontWeight: 700, color: '#22d3ee' }}>
                      {p.rent ? fmtRent(p.rent) : <span style={{ color: '#1e293b', fontWeight: 400, fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Unit */}
                    <td style={{ ...TD, color: '#64748b', fontSize: 11, fontFamily: 'monospace' }} title={p.propertyName}>
                      {p.propertyName || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Society Name */}
                    <td style={{ ...TD, color: '#f1f5f9', fontWeight: 600 }} title={p.projectName}>
                      {p.projectName || <span style={{ color: '#1e293b', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Sector */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      {p.sector
                        ? <Badge text={'Sec ' + p.sector} color="violet" />
                        : <span style={{ color: '#1e293b' }}>&mdash;</span>}
                    </td>

                    {/* Remarks */}
                    <td style={{ ...TD, color: '#475569', fontSize: 11 }} title={p.additionalNotes}>
                      {p.additionalNotes || <span style={{ color: '#0f172a', fontStyle: 'italic' }}>&mdash;</span>}
                    </td>

                    {/* Status */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <Badge text={p.availability || 'Available'} color={isAvail ? 'green' : 'rose'} />
                    </td>

                    {/* Actions */}
                    <td style={{ ...TD, textAlign: 'center', overflow: 'visible' }}>
                      {confirmDelete === p.sourceRow ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700, whiteSpace: 'nowrap' }}>Delete?</span>
                          <button onClick={() => handleDelete(p.sourceRow)} style={{ fontSize: 9, fontWeight: 800, color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>Yes</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>No</button>
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => handleEditOpen(p)} title="Edit" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#818cf8' }}><Pencil size={11} /></button>
                          <button onClick={() => setConfirmDelete(p.sourceRow)} title="Delete" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', color: '#f87171' }}><Trash2 size={11} /></button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>

          {/* Status footer */}
          {!loading && listings.length > 0 && (
            <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px', background: 'rgba(8,9,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155', fontWeight: 600 }}>
              <span>{filtered.length} rows shown of {listings.length} total</span>
              <span style={{ color: '#1e293b' }}>
                {listings.filter(l => (l.availability || '').toLowerCase() === 'available').length} available &nbsp;&middot;&nbsp;
                {listings.filter(l => (l.availability || '').toLowerCase() === 'rented').length} rented
              </span>
            </div>
          )}
        </div>
      </main>

      {/* ═══ Slide-in Edit Modal ═══════════════════════════════ */}
      {editRow && (
        <div onClick={() => setEditRow(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#090d16', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 6, background: 'rgba(129,140,248,0.1)', borderRadius: 8, color: '#818cf8' }}><Pencil size={15} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', margin: 0 }}>Edit Property</p>
                  <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>Row {editRow.sourceRow} — {editRow.projectName}</p>
                </div>
              </div>
              <button onClick={() => setEditRow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdate} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}><AlertCircle size={13} /> {error}</div>}
              {submitOk && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}><Check size={13} /> {submitOk}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ADD_FIELDS.map(f => (
                  <div key={f.name} style={{ gridColumn: f.type === 'textarea' ? 'span 2' : 'span 1' }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select name={f.name} value={form[f.name]} onChange={handleInput} style={{ ...INPUT_BASE, cursor: 'pointer' }}>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                    ) : f.type === 'textarea' ? (
                      <textarea name={f.name} value={form[f.name]} onChange={handleInput} placeholder={f.placeholder} rows={3} style={{ ...INPUT_BASE, height: 'auto', padding: '8px 10px', resize: 'none' }} />
                    ) : (
                      <input type={f.type} name={f.name} value={form[f.name]} onChange={handleInput} placeholder={f.placeholder} style={INPUT_BASE} />
                    )}
                  </div>
                ))}
              </div>
            </form>
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setEditRow(null)} disabled={submitting} style={{ height: 34, padding: '0 18px', fontSize: 12, fontWeight: 600, color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUpdate} disabled={submitting} style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, background: '#818cf8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{submitting ? 'Saving...' : <><Check size={13} /><span>Save Changes</span></>}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Slide-in Add Modal ════════════════════════════════ */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 480, background: '#090d16', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 6, background: 'rgba(124,58,237,0.1)', borderRadius: 8, color: '#a78bfa' }}><Building2 size={15} /></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', margin: 0 }}>Add Property Row</p>
                  <p style={{ fontSize: 10, color: '#475569', margin: 0 }}>Appends to live Google Sheet</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}><X size={16} /></button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdd} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}
              {submitOk && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14 }}>
                  <Check size={13} /> {submitOk}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ADD_FIELDS.map(f => (
                  <div key={f.name} style={{ gridColumn: f.type === 'textarea' ? 'span 2' : 'span 1' }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      {f.label}{f.required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select name={f.name} value={form[f.name]} onChange={handleInput}
                        style={{ ...INPUT_BASE, cursor: 'pointer' }}>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea name={f.name} value={form[f.name]} onChange={handleInput}
                        placeholder={f.placeholder} rows={3}
                        style={{ ...INPUT_BASE, height: 'auto', padding: '8px 10px', resize: 'none' }} />
                    ) : (
                      <input type={f.type} name={f.name} value={form[f.name]} onChange={handleInput}
                        placeholder={f.placeholder} required={f.required}
                        style={INPUT_BASE} />
                    )}
                  </div>
                ))}
              </div>
            </form>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setModalOpen(false)} disabled={submitting}
                style={{ height: 34, padding: '0 18px', fontSize: 12, fontWeight: 600, color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={submitting}
                style={{ height: 34, padding: '0 20px', fontSize: 12, fontWeight: 700, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting
                  ? 'Adding...'
                  : <><Plus size={13} /><span>Add to Sheet</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .skeleton { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
