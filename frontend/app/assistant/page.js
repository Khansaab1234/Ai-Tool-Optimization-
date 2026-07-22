'use client';
import { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';

export default function Assistant() {
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: "Namaste! Main aapka CNC assistant hoon. Poochiye — jaise 'rpm for 25mm aluminum', 'optimize my plan', ya 'best tool for roughing'." },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const r = await api.assistant(q);
      setMsgs((m) => [...m, { role: 'bot', text: r.answer }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'bot', text: 'Error: ' + e.message }]);
    }
    setBusy(false);
  };

  const chips = ['rpm for 12mm end mill in EN8', 'optimize my plan', 'best tool for roughing', 'what is MRR', 'cycle time & cost'];

  return (
    <div>
      <h2 className="section-title">AI Assistant</h2>
      <p className="section-sub">Ask about cutting parameters, tools, optimization and CNC.</p>

      <div className="panel" style={{ maxWidth: 760 }}>
        <div className="panel-b">
          <div className="chat-log">
            {msgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            <div ref={endRef} />
          </div>

          <div className="pill-list" style={{ marginTop: 12 }}>
            {chips.map((c) => <span key={c} className="chip gray" style={{ cursor: 'pointer' }} onClick={() => send(c)}>{c}</span>)}
          </div>

          <div className="chat-input">
            <input className="input" placeholder="Ask AI Assistant…" value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <button className="btn" style={{ width: 'auto' }} disabled={busy} onClick={() => send()}>{busy ? '…' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
