'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Calculator() {
  const [tab, setTab] = useState('milling');
  const [materials, setMaterials] = useState([]);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);

  const [mill, setMill] = useState({ d: 25, z: 4, vc: 180, fz: 0.12, ap: 2.5, ae: 20, material: 'Aluminum 6061' });
  const [turn, setTurn] = useState({ d: 50, vc: 200, f: 0.2, ap: 1.5, material: 'EN8' });
  const [drill, setDrill] = useState({ d: 10, vc: 30, f: 0.15, material: 'Aluminum 6061' });

  useEffect(() => { api.materials().then(setMaterials).catch(() => {}); }, []);

  const run = async () => {
    setErr(null);
    try {
      if (tab === 'milling') setRes(await api.milling(mill));
      else if (tab === 'turning') setRes(await api.turning(turn));
      else setRes(await api.drilling(drill));
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { run(); setRes(null); /* eslint-disable-next-line */ }, [tab]);

  const matOptions = materials.map((m) => <option key={m.name} value={m.name}>{m.name}</option>);

  return (
    <div>
      <h2 className="section-title">Cutting Calculator</h2>
      <p className="section-sub">Real machining formulas — spindle speed, feed rate, MRR, power &amp; forces.</p>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {['milling', 'turning', 'drilling'].map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <div className="panel-h"><h3>Inputs — {tab}</h3></div>
          <div className="panel-b">
            {tab === 'milling' && (
              <>
                <div className="field"><label>Material</label><select value={mill.material} onChange={(e) => setMill({ ...mill, material: e.target.value })}>{matOptions}</select></div>
                <div className="row2">
                  <Num label="Tool Diameter D (mm)" v={mill.d} on={(v) => setMill({ ...mill, d: v })} />
                  <Num label="No. of Flutes Z" v={mill.z} on={(v) => setMill({ ...mill, z: v })} />
                  <Num label="Cutting Speed Vc (m/min)" v={mill.vc} on={(v) => setMill({ ...mill, vc: v })} />
                  <Num label="Feed per Tooth fz (mm)" v={mill.fz} on={(v) => setMill({ ...mill, fz: v })} />
                  <Num label="Depth of Cut ap (mm)" v={mill.ap} on={(v) => setMill({ ...mill, ap: v })} />
                  <Num label="Width of Cut ae (mm)" v={mill.ae} on={(v) => setMill({ ...mill, ae: v })} />
                </div>
              </>
            )}
            {tab === 'turning' && (
              <>
                <div className="field"><label>Material</label><select value={turn.material} onChange={(e) => setTurn({ ...turn, material: e.target.value })}>{matOptions}</select></div>
                <div className="row2">
                  <Num label="Diameter D (mm)" v={turn.d} on={(v) => setTurn({ ...turn, d: v })} />
                  <Num label="Cutting Speed Vc (m/min)" v={turn.vc} on={(v) => setTurn({ ...turn, vc: v })} />
                  <Num label="Feed f (mm/rev)" v={turn.f} on={(v) => setTurn({ ...turn, f: v })} />
                  <Num label="Depth of Cut ap (mm)" v={turn.ap} on={(v) => setTurn({ ...turn, ap: v })} />
                </div>
              </>
            )}
            {tab === 'drilling' && (
              <>
                <div className="field"><label>Material</label><select value={drill.material} onChange={(e) => setDrill({ ...drill, material: e.target.value })}>{matOptions}</select></div>
                <div className="row2">
                  <Num label="Drill Diameter D (mm)" v={drill.d} on={(v) => setDrill({ ...drill, d: v })} />
                  <Num label="Cutting Speed Vc (m/min)" v={drill.vc} on={(v) => setDrill({ ...drill, vc: v })} />
                  <Num label="Feed f (mm/rev)" v={drill.f} on={(v) => setDrill({ ...drill, f: v })} />
                </div>
              </>
            )}
            <button className="btn" onClick={run}>Calculate</button>
            {err && <div className="err" style={{ marginTop: 12 }}>{err}</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>Results</h3></div>
          <div className="panel-b">
            {!res && <div className="muted">Enter values and press Calculate.</div>}
            {res && Object.keys(res.results).map((k) => (
              <div className="result" key={k}>
                <span className="k">{labelize(k)}</span>
                <span><span className="v">{res.results[k]}</span><span className="u">{res.units[k] || ''}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Num({ label, v, on }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type="number" step="any" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
function labelize(k) {
  const map = {
    spindleSpeed: 'Spindle Speed (N)', feedRate: 'Feed Rate (Vf)', mrr: 'MRR',
    cuttingPower: 'Cutting Power (net)', motorPower: 'Motor Power', torque: 'Torque',
    cuttingForce: 'Cutting Force', thrustForce: 'Thrust Force', chipThickness: 'Chip Thickness',
  };
  return map[k] || k;
}
