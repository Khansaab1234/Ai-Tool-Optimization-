'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Cnc() {
  const [cnc, setCnc] = useState(null);
  const [err, setErr] = useState(null);
  const [prog, setProg] = useState('O1001');
  const [part, setPart] = useState('Housing');

  const gen = async () => {
    setErr(null);
    try { setCnc(await api.generateCnc({ programNo: prog, partName: part })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);

  const copy = () => { if (cnc) navigator.clipboard && navigator.clipboard.writeText(cnc.text); };
  const download = () => {
    if (!cnc) return;
    const blob = new Blob([cnc.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${cnc.programNo}.nc`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="section-title">CNC Programming</h2>
      <p className="section-sub">Auto-generated ISO G-code from the operations plan.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0 }}><label>Program No.</label><input className="input" value={prog} onChange={(e) => setProg(e.target.value)} style={{ width: 140 }} /></div>
        <div className="field" style={{ margin: 0 }}><label>Part Name</label><input className="input" value={part} onChange={(e) => setPart(e.target.value)} style={{ width: 180 }} /></div>
        <button className="btn" style={{ width: 'auto' }} onClick={gen}>Generate</button>
        <button className="btn ghost" style={{ width: 'auto' }} onClick={copy}>Copy</button>
        <button className="btn ghost" style={{ width: 'auto' }} onClick={download}>Download .nc</button>
      </div>

      {err && <div className="err">{err}</div>}
      <div className="panel">
        <div className="panel-h"><h3>{cnc ? cnc.programNo : ''} — {cnc ? cnc.lineCount : 0} blocks</h3><span className="muted mono">{cnc ? cnc.material : ''}</span></div>
        <div className="panel-b">
          <div className="code" style={{ maxHeight: 560 }}>
            {cnc && cnc.lines.map((l, i) => (
              <div key={i}>
                <span className="ln">{l.n}</span>
                <span className={l.text.startsWith('(') ? 'c' : ''}>{colorize(l.text)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function colorize(text) {
  if (text.startsWith('(')) return text;
  return text;
}
