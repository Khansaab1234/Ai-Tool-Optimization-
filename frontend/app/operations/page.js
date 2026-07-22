'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Operations() {
  const [ops, setOps] = useState([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.operations(1).then((d) => { setOps(d.operations); setTotal(d.totalTime); }).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <h2 className="section-title">Operations Plan</h2>
      <p className="section-sub">Sequence of machining operations for part P-1001 (Housing) on VMX 850.</p>
      {err && <div className="err">{err}</div>}
      <div className="panel">
        <div className="panel-b" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Op No.</th><th>Operation</th><th>Machine</th><th>Tool</th><th>RPM</th><th>Feed (mm/min)</th><th style={{ textAlign: 'right' }}>Time (min)</th></tr></thead>
            <tbody>
              {ops.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.opNo}</td>
                  <td>{o.operation}</td>
                  <td>{o.machine}</td>
                  <td className="mono">{o.tool}</td>
                  <td className="mono">{o.rpm}</td>
                  <td className="mono">{o.feed}</td>
                  <td style={{ textAlign: 'right' }} className="mono">{Number(o.time).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="t-strong"><td colSpan={6}>Total Cycle Time</td><td style={{ textAlign: 'right', color: 'var(--cyan)' }} className="mono">{total.toFixed(2)} min</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
