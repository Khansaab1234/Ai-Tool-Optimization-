'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState(null);

  const load = async (query = '') => {
    try { setTools(await api.tools(query)); } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 className="section-title">Tool Library</h2>
      <p className="section-sub">Cutting tool catalog with stock, coating and recommendations.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 420 }}>
        <input className="input" placeholder="Search code, name, type…" value={q}
          onChange={(e) => { setQ(e.target.value); load(e.target.value); }} />
      </div>

      {err && <div className="err">{err}</div>}

      <div className="panel">
        <div className="panel-b" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Ø (mm)</th><th>Flutes</th><th>Material</th><th>Coating</th><th>Stock</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.id}>
                  <td className="mono">{t.code}</td>
                  <td>{t.name}</td>
                  <td>{t.type}</td>
                  <td>{t.diameter}</td>
                  <td>{t.flutes}</td>
                  <td>{t.material}</td>
                  <td>{t.coating}</td>
                  <td>{t.stock}</td>
                  <td className="mono">₹{t.price}</td>
                  <td>{t.recommended ? <span className="chip green">Recommended</span> : ''}</td>
                </tr>
              ))}
              {tools.length === 0 && <tr><td colSpan={10} className="muted" style={{ textAlign: 'center', padding: 24 }}>No tools found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
