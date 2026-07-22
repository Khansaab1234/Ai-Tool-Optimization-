'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function PPC() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({ partName: '', material: 'Aluminum 6061', orderQty: 10, dueDate: '' });
  const [busy, setBusy] = useState(false);

  const load = () => api.ppc().then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.partName) return;
    setBusy(true);
    try { await api.createProject(form); setForm({ partName: '', material: 'Aluminum 6061', orderQty: 10, dueDate: '' }); await load(); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (err) return <div className="err">{err}</div>;
  if (!data) return <div className="loading">Loading…</div>;

  return (
    <div>
      <h2 className="section-title">Production Planning &amp; Control</h2>
      <p className="section-sub">Track parts, quantities, schedule and progress.</p>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        {Object.entries(data.summary).map(([k, v]) => (
          <div className="stat" key={k}><div className="label">{k}</div><div className="value">{v}</div></div>
        ))}
        <div className="stat"><div className="label">Total Plans</div><div className="value">{data.total}</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-h"><h3>Production Plan</h3></div>
          <div className="panel-b" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Part No.</th><th>Name</th><th>Qty</th><th>Material</th><th>Start</th><th>Due</th><th>Status</th><th>Progress</th></tr></thead>
              <tbody>
                {data.plans.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.partNo}</td>
                    <td>{p.partName}</td>
                    <td>{p.orderQty}</td>
                    <td>{p.material}</td>
                    <td className="mono">{p.startDate}</td>
                    <td className="mono">{p.dueDate}</td>
                    <td><span className={`chip ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td><div className="progress"><span style={{ width: `${p.progress}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>New Project</h3></div>
          <div className="panel-b">
            <div className="field"><label>Part Name</label><input className="input" value={form.partName} onChange={(e) => setForm({ ...form, partName: e.target.value })} placeholder="e.g. Bracket" /></div>
            <div className="field"><label>Material</label>
              <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}>
                {['Aluminum 6061', 'EN8', 'Alloy Steel', 'Stainless Steel', 'Cast Iron', 'Brass', 'Titanium'].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="row2">
              <div className="field"><label>Order Qty</label><input className="input" type="number" value={form.orderQty} onChange={(e) => setForm({ ...form, orderQty: e.target.value })} /></div>
              <div className="field"><label>Due Date</label><input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <button className="btn" onClick={create} disabled={busy}>{busy ? 'Adding…' : '+ Add Project'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusColor(s) {
  return { 'In Progress': 'amber', Planned: 'blue', Completed: 'green' }[s] || 'gray';
}
