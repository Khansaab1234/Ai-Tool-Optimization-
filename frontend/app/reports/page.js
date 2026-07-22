'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Reports() {
  const [r, setR] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { api.reports().then(setR).catch((e) => setErr(e.message)); }, []);

  if (err) return <div className="err">{err}</div>;
  if (!r) return <div className="loading">Generating report…</div>;
  const k = r.kpis, o = r.optimization;

  const print = () => window.print();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Reports</h2>
          <p className="section-sub">Project KPIs and optimization summary · generated {new Date(r.generatedAt).toLocaleString('en-IN')}</p>
        </div>
        <button className="btn ghost" style={{ width: 'auto' }} onClick={print}>Print / PDF</button>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="label">Total Operations</div><div className="value">{k.totalOperations}</div></div>
        <div className="stat"><div className="label">Total Cycle Time</div><div className="value">{k.totalCycleTime} min</div></div>
        <div className="stat"><div className="label">Overall Efficiency</div><div className="value">{k.overallEfficiency}%</div></div>
        <div className="stat"><div className="label">Projects</div><div className="value">{k.projects}</div></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-h"><h3>Part Details</h3></div>
          <div className="panel-b">
            <div className="result"><span className="k">Part No.</span><span className="v">{r.part.partNo}</span></div>
            <div className="result"><span className="k">Name</span><span className="v">{r.part.name}</span></div>
            <div className="result"><span className="k">Material</span><span className="v">{r.part.material}</span></div>
            <div className="result"><span className="k">Dimensions</span><span className="v">{r.part.dimensions.x}×{r.part.dimensions.y}×{r.part.dimensions.z} mm</span></div>
            <div className="result"><span className="k">Weight</span><span className="v">{r.part.weight} kg</span></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>Optimization Summary</h3></div>
          <div className="panel-b">
            <div className="result"><span className="k">Original Time</span><span className="v">{o.originalTime} min</span></div>
            <div className="result"><span className="k">Optimized Time</span><span className="v" style={{ color: 'var(--green)' }}>{o.optimizedTime} min</span></div>
            <div className="result"><span className="k">Time Saving</span><span className="v">{o.timeSavingPct}%</span></div>
            <div className="result"><span className="k">Cost (before → after)</span><span className="v">{inr(o.totalCostBefore)} → {inr(o.totalCostAfter)}</span></div>
            <div className="result"><span className="k">Cost Saving</span><span className="v" style={{ color: 'var(--cyan)' }}>{o.costSavingPct}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
