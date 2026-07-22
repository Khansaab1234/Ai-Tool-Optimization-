'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Optimization() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => { api.optimize({}).then(setData).catch((e) => setErr(e.message)); }, []);

  if (err) return <div className="err">{err}</div>;
  if (!data) return <div className="loading">Optimizing…</div>;
  const s = data.summary;

  return (
    <div>
      <h2 className="section-title">Tool Optimization</h2>
      <p className="section-sub">AI-driven tool &amp; strategy optimization with time and cost savings.</p>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Card label="Time Saving" value={`${s.timeSavingPct}%`} sub={`${s.timeSavedMin} min saved`} c="var(--green)" />
        <Card label="Cost Saving" value={`${s.costSavingPct}%`} sub={`${inr(s.totalCostBefore)} → ${inr(s.totalCostAfter)}`} c="var(--cyan)" />
        <Card label="Tool Change ↓" value={`${s.toolChangeReductionPct}%`} sub="fewer tool changes" c="var(--amber)" />
        <Card label="Optimized Time" value={`${s.optimizedTime} min`} sub={`from ${s.originalTime} min`} c="var(--accent-2)" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-h"><h3>Operation-wise Optimization</h3></div>
          <div className="panel-b" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Op</th><th>Operation</th><th>Original (min)</th><th>Optimized (min)</th><th>Saved</th></tr></thead>
              <tbody>
                {data.operations.map((o) => (
                  <tr key={o.opNo}>
                    <td className="mono">{o.opNo}</td>
                    <td>{o.operation}</td>
                    <td className="mono">{Number(o.time).toFixed(2)}</td>
                    <td className="mono">{o.optimizedTime.toFixed(2)}</td>
                    <td className="mono" style={{ color: 'var(--green)' }}>▼ {o.saved.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>AI Suggestions</h3></div>
          <div className="panel-b">
            {data.suggestions.map((sg, i) => (
              <div className="ai-highlight" key={i}><span className="dot">✦</span><span><b className="chip blue" style={{ marginRight: 6 }}>{sg.type}</b>{sg.message}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, sub, c }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value" style={{ color: c }}>{value}</div>
      <div className="delta" style={{ color: 'var(--text-mut)' }}>{sub}</div>
    </div>
  );
}
