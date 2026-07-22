'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Part() {
  const [p, setP] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { api.part().then(setP).catch((e) => setErr(e.message)); }, []);

  if (err) return <div className="err">{err}</div>;
  if (!p) return <div className="loading">Loading part…</div>;

  return (
    <div>
      <h2 className="section-title">Part &amp; 3D Model</h2>
      <p className="section-sub">Geometry and feature overview of the selected part.</p>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-h"><h3>3D Model</h3><span className="chip blue">{p.material}</span></div>
          <div className="panel-b">
            <div style={{ height: 320, borderRadius: 12, background: 'radial-gradient(circle at 50% 40%, #1b3a5f, #0b1a2e)', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>
              <svg width="320" height="240" viewBox="0 0 320 240">
                <g stroke="#5b8fd6" strokeWidth="1.6">
                  <polygon points="70,100 160,55 250,100 160,145" fill="#2c568a" />
                  <polygon points="70,100 160,145 160,200 70,155" fill="#1d3a5f" />
                  <polygon points="250,100 160,145 160,200 250,155" fill="#264a75" />
                </g>
                <ellipse cx="160" cy="100" rx="30" ry="15" fill="#0d1b30" stroke="#5b8fd6" strokeWidth="1.3" />
                <circle cx="110" cy="118" r="4" fill="#0d1b30" stroke="#5b8fd6" />
                <circle cx="210" cy="118" r="4" fill="#0d1b30" stroke="#5b8fd6" />
                <circle cx="110" cy="150" r="4" fill="#0d1b30" stroke="#5b8fd6" />
                <circle cx="210" cy="150" r="4" fill="#0d1b30" stroke="#5b8fd6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>Part Details</h3></div>
          <div className="panel-b">
            <div className="result"><span className="k">Part No.</span><span className="v">{p.partNo}</span></div>
            <div className="result"><span className="k">Name</span><span className="v">{p.name}</span></div>
            <div className="result"><span className="k">Material</span><span className="v">{p.material}</span></div>
            <div className="result"><span className="k">Dimensions (mm)</span><span className="v">{p.dimensions.x} × {p.dimensions.y} × {p.dimensions.z}</span></div>
            <div className="result"><span className="k">Weight</span><span className="v">{p.weight} kg</span></div>
            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ marginBottom: 8 }}>Features</div>
              <div className="pill-list">{p.features.map((f) => <span key={f} className="chip gray">{f}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
