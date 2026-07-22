'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import Donut from '../components/Donut';

const inr = (n) => '₹ ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [ops, setOps] = useState([]);
  const [cnc, setCnc] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [d, o, c] = await Promise.all([api.dashboard(), api.operations(1), api.generateCnc({})]);
        setData(d);
        setOps(o.operations);
        setCnc(c);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  if (err) return <div className="err">API se connect nahi ho paya: {err}. Kya backend chal raha hai? (npm run dev in /backend)</div>;
  if (!data) return <div className="loading">Loading dashboard…</div>;

  const totalTime = ops.reduce((s, o) => s + Number(o.time), 0);
  const mu = data.machineUtilization;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr 0.95fr', gap: 16 }}>
      {/* ---- Part 3D ---- */}
      <div className="panel">
        <div className="panel-h"><h3>Part 3D Model</h3><span className="chip blue">Housing · Al 6061</span></div>
        <div className="panel-b">
          <div style={{ height: 220, borderRadius: 12, background: 'radial-gradient(circle at 50% 40%, #1b3a5f, #0b1a2e)', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>
            <IsoPart />
          </div>
          <div className="pill-list" style={{ marginTop: 12 }}>
            {['Top pocket', '4× M8 tapped', 'Contour profile', '10mm bores'].map((f) => (
              <span key={f} className="chip gray">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Operations plan ---- */}
      <div className="panel">
        <div className="panel-h"><h3>Operations Plan</h3><span className="muted mono">VMX 850</span></div>
        <div className="panel-b" style={{ paddingTop: 4 }}>
          <table>
            <thead><tr><th>Op</th><th>Operation</th><th style={{ textAlign: 'right' }}>Time (min)</th></tr></thead>
            <tbody>
              {ops.map((o) => (
                <tr key={o.opNo}><td className="mono">{o.opNo}</td><td>{o.operation}</td><td style={{ textAlign: 'right' }} className="mono">{o.time.toFixed(2)}</td></tr>
              ))}
              <tr className="t-strong"><td></td><td>Total Time</td><td style={{ textAlign: 'right', color: 'var(--cyan)' }} className="mono">{totalTime.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- AI Assistant ---- */}
      <div className="panel">
        <div className="panel-h"><h3>AI Assistant</h3><span className="chip green">Optimized</span></div>
        <div className="panel-b">
          <div className="ai-card">
            <div className="muted" style={{ fontSize: 13 }}>I have optimized the tools and machining strategy for you.</div>
            <div style={{ margin: '10px 0 2px', fontSize: 13 }}>Estimated Cycle Time</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>reduced by <span style={{ color: '#8b7bff' }}>{data.estimatedCycleReductionPct}%</span></div>
          </div>
          <div style={{ marginTop: 12 }}>
            {data.aiHighlights.map((h, i) => (
              <div className="ai-highlight" key={i}><span className="dot">✓</span>{h}</div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => router.push('/assistant')}>Ask AI Assistant →</button>
        </div>
      </div>

      {/* ---- CNC preview ---- */}
      <div className="panel" style={{ gridColumn: 'span 2' }}>
        <div className="panel-h"><h3>CNC Program Preview</h3><span className="muted mono">{cnc ? cnc.programNo : ''} · {cnc ? cnc.lineCount : 0} lines</span></div>
        <div className="panel-b">
          <div className="code">
            {cnc && cnc.lines.slice(0, 22).map((l, i) => (
              <div key={i}>
                <span className="ln">{l.n}</span>
                <span className={l.text.startsWith('(') ? 'c' : ''}>{l.text}</span>
              </div>
            ))}
          </div>
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => router.push('/cnc')}>Open full CNC program</button>
        </div>
      </div>

      {/* ---- Quick calculator ---- */}
      <QuickCalc router={router} />

      {/* ---- Stat cards ---- */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div className="stat-row">
          <StatCard label="Total Cycle Time" value={`${totalTime.toFixed(2)} min`} delta={`▼ ${data.cycleTimeOptimizedPct}% Optimized`} cls="down" bg="rgba(34,197,94,0.15)" ico="⏱" />
          <StatCard label="Total Tool Cost" value={inr(data.totalToolCost)} delta={`▼ ${data.toolCostOptimizedPct}% Optimized`} cls="down" bg="rgba(245,158,11,0.15)" ico="₹" />
          <StatCard label="Total Machining Cost" value={inr(data.totalMachiningCost)} delta={`▼ ${data.machiningCostOptimizedPct}% Optimized`} cls="down" bg="rgba(124,92,255,0.15)" ico="⚙" />
          <StatCard label="Overall Efficiency" value={`${data.overallEfficiency}%`} delta={`▲ ${data.efficiencyImprovedPct}% Improved`} cls="up" bg="rgba(47,107,255,0.15)" ico="📈" />
        </div>
      </div>

      {/* ---- PPC summary ---- */}
      <div className="panel" style={{ gridColumn: 'span 2' }}>
        <div className="panel-h"><h3>PPC Plan Summary</h3><span className="muted">{data.projects.length} projects</span></div>
        <div className="panel-b" style={{ paddingTop: 4 }}>
          <table>
            <thead><tr><th>Part No.</th><th>Part Name</th><th>Qty</th><th>Material</th><th>Due</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {data.projects.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.partNo}</td>
                  <td>{p.partName}</td>
                  <td>{p.orderQty}</td>
                  <td>{p.material}</td>
                  <td className="mono">{p.dueDate}</td>
                  <td><StatusChip status={p.status} /></td>
                  <td><div className="progress"><span style={{ width: `${p.progress}%` }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Tool rec + Machine util ---- */}
      <div className="panel">
        <div className="panel-h"><h3>Tool Recommendation</h3></div>
        <div className="panel-b">
          {data.recommendedTool && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: 'linear-gradient(135deg,#2b3f5c,#16314f)', display: 'grid', placeItems: 'center', fontSize: 22 }}>🔩</div>
              <div>
                <div style={{ fontWeight: 700 }}>{data.recommendedTool.code}</div>
                <div className="muted" style={{ fontSize: 12 }}>Ø{data.recommendedTool.diameter} · {data.recommendedTool.flutes} Flute · {data.recommendedTool.name}</div>
                <span className="chip green" style={{ marginTop: 6 }}>Recommended</span>
              </div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <div className="panel-h" style={{ padding: '0 0 12px' }}><h3>Machine Utilization</h3></div>
            <Donut data={[
              { label: 'Running', value: mu.running, color: '#22c55e' },
              { label: 'Idle', value: mu.idle, color: '#f59e0b' },
              { label: 'Setup', value: mu.setup, color: '#2f6bff' },
              { label: 'Down', value: mu.down, color: '#ef4444' },
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, cls, bg, ico }) {
  return (
    <div className="stat">
      <div className="badge" style={{ background: bg }}>{ico}</div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className={`delta ${cls}`}>{delta}</div>
    </div>
  );
}

function StatusChip({ status }) {
  const map = { 'In Progress': 'amber', Planned: 'blue', Completed: 'green' };
  return <span className={`chip ${map[status] || 'gray'}`}>{status}</span>;
}

function QuickCalc({ router }) {
  const [tab, setTab] = useState('milling');
  const [res, setRes] = useState(null);
  const [f, setF] = useState({ d: 25, z: 4, vc: 180, fz: 0.12, ap: 2.5, ae: 20 });

  const calc = async () => {
    try { setRes(await api.milling(f)); } catch (e) { /* ignore */ }
  };
  useEffect(() => { calc(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="panel">
      <div className="panel-h"><h3>Quick Calculator</h3><div className="tabs" style={{ transform: 'scale(0.85)' }}>
        {['milling', 'turning', 'drilling'].map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); if (t !== 'milling') router.push('/calculator'); }}>{t[0].toUpperCase() + t.slice(1)}</div>
        ))}
      </div></div>
      <div className="panel-b">
        <div className="row2">
          <div className="field"><label>Tool Ø (mm)</label><input className="input" type="number" value={f.d} onChange={(e) => setF({ ...f, d: e.target.value })} /></div>
          <div className="field"><label>Flutes (Z)</label><input className="input" type="number" value={f.z} onChange={(e) => setF({ ...f, z: e.target.value })} /></div>
          <div className="field"><label>Cutting Speed Vc</label><input className="input" type="number" value={f.vc} onChange={(e) => setF({ ...f, vc: e.target.value })} /></div>
          <div className="field"><label>Feed/Tooth fz</label><input className="input" type="number" value={f.fz} onChange={(e) => setF({ ...f, fz: e.target.value })} /></div>
          <div className="field"><label>Depth ap</label><input className="input" type="number" value={f.ap} onChange={(e) => setF({ ...f, ap: e.target.value })} /></div>
          <div className="field"><label>Width ae</label><input className="input" type="number" value={f.ae} onChange={(e) => setF({ ...f, ae: e.target.value })} /></div>
        </div>
        <button className="btn" onClick={calc}>Calculate</button>
        {res && (
          <div style={{ marginTop: 12 }}>
            <div className="result"><span className="k">Spindle Speed (N)</span><span><span className="v">{res.results.spindleSpeed}</span><span className="u">rpm</span></span></div>
            <div className="result"><span className="k">Feed Rate (Vf)</span><span><span className="v">{res.results.feedRate}</span><span className="u">mm/min</span></span></div>
            <div className="result"><span className="k">MRR</span><span><span className="v">{res.results.mrr}</span><span className="u">cm³/min</span></span></div>
            <div className="result"><span className="k">Power</span><span><span className="v">{res.results.cuttingPower}</span><span className="u">kW</span></span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function IsoPart() {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150">
      <g stroke="#5b8fd6" strokeWidth="1.5" fill="#22436b" opacity="0.95">
        <polygon points="40,60 100,30 160,60 100,90" fill="#2c568a" />
        <polygon points="40,60 100,90 100,130 40,100" fill="#1d3a5f" />
        <polygon points="160,60 100,90 100,130 160,100" fill="#264a75" />
      </g>
      <ellipse cx="100" cy="60" rx="20" ry="10" fill="#0d1b30" stroke="#5b8fd6" strokeWidth="1.2" />
      <circle cx="70" cy="72" r="3" fill="#0d1b30" stroke="#5b8fd6" />
      <circle cx="130" cy="72" r="3" fill="#0d1b30" stroke="#5b8fd6" />
    </svg>
  );
}
