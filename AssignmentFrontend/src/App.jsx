import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { packageApi } from './api.js';
import { Package, Plus, Search, RefreshCw, Pencil, Trash2, MapPin, CheckCircle2, AlertCircle, X, List, ArrowLeft, Save, Box, Truck } from 'lucide-react';

const initialForm = () => ({ trackingCode: '', currentLocation: '', lastUpdated: new Date().toISOString().slice(0, 10), delivered: false });
const normalize = (p) => ({ id: p?.id, trackingCode: p?.trackingCode ?? '', currentLocation: p?.currentLocation ?? '', lastUpdated: p?.lastUpdated ?? '', delivered: Boolean(p?.delivered) });

function App() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleting, setDeleting] = useState(false);

  const notify = (type, message) => setNotice({ type, message });
  const loadPackages = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await packageApi.all();
      if (!Array.isArray(data)) throw new Error('The backend did not return a package list.');
      const records = data.map(normalize);
      setPackages(records);
      setDeleteId((current) => current || (records[0]?.id != null ? String(records[0].id) : ''));
    } catch (error) { notify('danger', error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadPackages(); }, [loadPackages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter(p => String(p.id ?? '').includes(q) || p.trackingCode.toLowerCase().includes(q) || p.currentLocation.toLowerCase().includes(q) || (p.delivered ? 'delivered' : 'in transit').includes(q));
  }, [packages, query]);

  function updateField(e) {
    const { name, value, checked, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
  function validate() {
    const next = {};
    const code = form.trackingCode.trim();
    if (!code) next.trackingCode = 'Tracking code is required.';
    else if (!/^\d{5}$/.test(code)) next.trackingCode = 'Tracking code must contain exactly 5 digits.';
    if (!form.currentLocation.trim()) next.currentLocation = 'Current location is required.';
    else if (form.currentLocation.trim().length > 100) next.currentLocation = 'Location must not exceed 100 characters.';
    if (!form.lastUpdated || Number.isNaN(Date.parse(form.lastUpdated))) next.lastUpdated = 'Enter a valid date.';
    else if (form.lastUpdated > new Date().toISOString().slice(0, 10)) next.lastUpdated = 'Date cannot be in the future.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function clearForm() { setForm(initialForm()); setErrors({}); setEditingId(null); }
  async function submit(e) {
    e.preventDefault(); setNotice(null);
    if (!validate()) return;
    setSaving(true);
    const payload = { trackingCode: form.trackingCode.trim(), currentLocation: form.currentLocation.trim(), lastUpdated: form.lastUpdated, delivered: Boolean(form.delivered) };
    try {
      if (editingId !== null) { await packageApi.update(editingId, payload); notify('success', `Package ID ${editingId} updated successfully.`); }
      else { const result = await packageApi.add(payload); notify('success', `Package added successfully${result?.id != null ? ` (ID: ${result.id})` : ''}.`); }
      clearForm(); await loadPackages(false);
    } catch (error) { notify('danger', error.message); }
    finally { setSaving(false); }
  }
  function edit(p) {
    setEditingId(p.id); setForm({ trackingCode: p.trackingCode, currentLocation: p.currentLocation, lastUpdated: p.lastUpdated, delivered: p.delivered }); setErrors({}); setNotice(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function removeById(id) {
    const p = packages.find(item => String(item.id) === String(id));
    if (!p) { notify('warning', 'Choose a package that exists.'); return; }
    if (!window.confirm(`Delete package ${p.trackingCode} (ID ${p.id})? This cannot be undone.`)) return;
    setDeleting(true);
    try { const result = await packageApi.remove(p.id); notify('success', typeof result === 'string' && result ? result : `Package ID ${p.id} deleted successfully.`); if (String(lookupId) === String(p.id)) setLookupResult(null); await loadPackages(false); }
    catch (error) { notify('danger', error.message); }
    finally { setDeleting(false); }
  }
  async function findById(e) {
    e.preventDefault();
    if (!/^\d+$/.test(lookupId.trim()) || Number(lookupId) <= 0) { notify('warning', 'Enter a positive whole-number package ID.'); return; }
    setLookupLoading(true); setLookupResult(null);
    try { const result = await packageApi.byId(lookupId.trim()); if (!result || result.id == null) throw new Error('Package not found. Check the ID and try again.'); setLookupResult(normalize(result)); }
    catch (error) { notify('danger', error.message); }
    finally { setLookupLoading(false); }
  }
  function startEditSelected() {
    const p = packages.find(item => String(item.id) === String(deleteId));
    if (!p) { notify('warning', 'Choose a package to update.'); return; }
    edit(p); document.getElementById('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return <div className="app" id="top">
    <nav className="navbar app-nav">
      <div className="nav-inner">
        <a className="navbar-brand" href="#top"><span className="brand-icon"><Package size={22}/></span><span><strong>PackageFlow</strong><small>Package Tracking</small></span></a>
        <div className="nav-links"><a className="active" href="#records"><List size={14}/> Packages</a><a href="#find"><Search size={14}/> Find by ID</a><span className="avatar">P</span></div>
      </div>
    </nav>
    <main className="page" id="top-content">
      <header className="page-heading"><div><h1>Package Tracking</h1><p className="subheading">Add, view, update and manage your package records.</p></div><button className="btn btn-outline-secondary refresh-btn" onClick={() => loadPackages()} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button></header>
      {notice && <div className={`alert alert-${notice.type} notice`} role="alert">{notice.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}<span>{notice.message}</span><button className="notice-close" onClick={() => setNotice(null)} aria-label="Dismiss"><X size={17}/></button></div>}
      <section className="summary-row"><div className="summary total"><span className="metric-icon"><Box size={21}/></span><div><span>Total packages</span><strong>{packages.length}</strong></div></div><div className="summary delivered"><span className="metric-icon"><CheckCircle2 size={22}/></span><div><span>Delivered</span><strong>{packages.filter(p => p.delivered).length}</strong></div></div><div className="summary transit"><span className="metric-icon"><Truck size={22}/></span><div><span>In transit</span><strong>{packages.filter(p => !p.delivered).length}</strong></div></div></section>
      <section className="content-grid">
        <section className="panel" id="form"><div className="panel-heading"><span className="heading-icon"><Plus size={19}/></span><div><h2>{editingId !== null ? 'Update Package' : 'Add Package'}</h2>{editingId !== null && <p>Editing package ID {editingId}</p>}</div>{editingId !== null && <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={clearForm}>Cancel</button>}</div>
          <form onSubmit={submit} noValidate><div className="mb-3"><label className="form-label" htmlFor="trackingCode">Tracking Code <b>*</b></label><input className={`form-control ${errors.trackingCode ? 'is-invalid' : ''}`} id="trackingCode" name="trackingCode" value={form.trackingCode} onChange={updateField} maxLength={5} inputMode="numeric" placeholder="Enter 5-digit tracking code"/><div className="form-hint">Exactly 5 digits</div>{errors.trackingCode && <div className="invalid-feedback">{errors.trackingCode}</div>}</div>
          <div className="mb-3"><label className="form-label" htmlFor="currentLocation">Current Location <b>*</b></label><input className={`form-control ${errors.currentLocation ? 'is-invalid' : ''}`} id="currentLocation" name="currentLocation" value={form.currentLocation} onChange={updateField} maxLength={100} placeholder="Enter current location"/>{errors.currentLocation && <div className="invalid-feedback">{errors.currentLocation}</div>}</div>
          <div className="mb-3"><label className="form-label" htmlFor="lastUpdated">Last Updated <b>*</b></label><input type="date" className={`form-control ${errors.lastUpdated ? 'is-invalid' : ''}`} id="lastUpdated" name="lastUpdated" value={form.lastUpdated} max={new Date().toISOString().slice(0,10)} onChange={updateField}/>{errors.lastUpdated && <div className="invalid-feedback">{errors.lastUpdated}</div>}</div>
          <label className="form-check mb-3"><input className="form-check-input" type="checkbox" name="delivered" checked={form.delivered} onChange={updateField}/><span className="form-check-label">Package delivered</span></label><div className="d-flex gap-2"><button className="btn btn-primary flex-grow-1" type="submit" disabled={saving}>{saving ? <span className="spinner-border spinner-border-sm"/> : editingId !== null ? <Save size={16}/> : <Plus size={16}/>} {saving ? 'Saving…' : editingId !== null ? 'Update Package' : 'Add Package'}</button>{editingId === null && <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>Clear</button>}</div></form>
        </section>
        <section className="panel" id="find"><div className="panel-heading"><span className="heading-icon"><Search size={19}/></span><div><h2>Find Package by ID</h2><p>Use the generated database ID.</p></div></div><form onSubmit={findById}><label className="form-label" htmlFor="lookupId">Package ID <b>*</b></label><div className="input-group"><input className="form-control" id="lookupId" value={lookupId} onChange={e => setLookupId(e.target.value)} inputMode="numeric" pattern="[0-9]*" placeholder="Enter package ID"/><button className="btn btn-primary" type="submit" disabled={lookupLoading}>{lookupLoading ? <span className="spinner-border spinner-border-sm"/> : <><Search size={16}/> Search</>}</button></div></form>
          {lookupResult && <div className="lookup-result"><div className="result-header"><strong>Package #{lookupResult.id}</strong><Status delivered={lookupResult.delivered}/></div><p><b>Tracking:</b> {lookupResult.trackingCode}</p><p><MapPin size={14}/> {lookupResult.currentLocation}</p><p className="muted">Last updated: {lookupResult.lastUpdated || '—'}</p><button className="btn btn-sm btn-outline-primary" onClick={() => edit(lookupResult)}><Pencil size={13}/> Edit package</button></div>}
        </section>
      </section>
      <section className="panel records-panel" id="records"><div className="records-heading"><div className="panel-heading"><span className="heading-icon"><List size={19}/></span><div><h2>All Packages</h2><p>{filtered.length} of {packages.length} records</p></div></div><label className="record-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID, code, location or status…" aria-label="Search packages"/></label></div>
        {loading ? <div className="empty-state"><span className="spinner-border spinner-border-sm text-primary"/> Loading packages…</div> : filtered.length === 0 ? <div className="empty-state">{packages.length ? 'No matching packages.' : 'No packages found. Add your first package above.'}</div> : <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>ID</th><th>Tracking Code</th><th>Current Location</th><th>Last Updated</th><th>Delivery Status</th><th className="text-end">Actions</th></tr></thead><tbody>{filtered.map(p => <tr key={p.id ?? p.trackingCode}><td><span className="id-badge">{p.id ?? '—'}</span></td><td className="fw-semibold">{p.trackingCode || '—'}</td><td><span className="location"><MapPin size={14}/>{p.currentLocation || '—'}</span></td><td>{p.lastUpdated || '—'}</td><td><Status delivered={p.delivered}/></td><td><div className="table-actions"><button className="btn btn-sm btn-edit" onClick={() => edit(p)} title="Edit package"><Pencil size={14}/> Edit</button><button className="btn btn-sm btn-delete" onClick={() => removeById(p.id)} title="Delete package"><Trash2 size={14}/> Delete</button></div></td></tr>)}</tbody></table></div>}
      </section>
      <section className="operations-grid" aria-label="Package operations">
        <article className="operation-card"><div className="operation-top"><Package size={18}/><span>PackageFlow</span><small>Update</small></div><h2>Update Package</h2><p>Select a record to load it into the update form.</p><label className="form-label" htmlFor="updateSelect">Choose package</label><select className="form-select" id="updateSelect" value={deleteId} onChange={e => setDeleteId(e.target.value)}><option value="">Select package ID</option>{packages.map(p => <option key={p.id} value={p.id}>#{p.id} · {p.trackingCode}</option>)}</select><button className="btn btn-primary operation-action" type="button" onClick={startEditSelected} disabled={!deleteId}><Pencil size={14}/> Load for update</button><div className="operation-placeholder">The form above will open for editing.</div></article>
        <article className="operation-card delete-operation"><div className="operation-top"><Package size={18}/><span>PackageFlow</span><small>Delete</small></div><h2>Delete Package</h2><p>Remove a package record permanently.</p><label className="form-label" htmlFor="deleteSelect">Choose package</label><select className="form-select" id="deleteSelect" value={deleteId} onChange={e => setDeleteId(e.target.value)}><option value="">Select package ID</option>{packages.map(p => <option key={p.id} value={p.id}>#{p.id} · {p.trackingCode}</option>)}</select><div className="delete-warning"><AlertCircle size={18}/><span>This action cannot be undone.</span></div><button className="btn btn-danger operation-action" type="button" onClick={() => removeById(deleteId)} disabled={!deleteId || deleting}>{deleting ? 'Deleting…' : <><Trash2 size={14}/> Delete Package</>}</button></article>
      </section>
      <footer className="footer">PackageFlow · Package Tracking System · React + Bootstrap + Spring Boot</footer>
    </main>
  </div>;
}
function Status({ delivered }) { return <span className={`status ${delivered ? 'is-delivered' : 'is-transit'}`}>{delivered ? 'DELIVERED' : 'IN_TRANSIT'}</span>; }
export default App;
