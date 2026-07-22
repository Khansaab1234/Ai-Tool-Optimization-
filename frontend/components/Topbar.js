'use client';
import { usePathname } from 'next/navigation';

const TITLES = {
  '/': 'AI CNC Programming & Tool Optimization',
  '/part': 'Part & 3D Model',
  '/operations': 'Operations Plan',
  '/cnc': 'CNC Programming',
  '/tools': 'Tool Library',
  '/optimization': 'Tool Optimization',
  '/calculator': 'Cutting Calculator',
  '/ppc': 'Production Planning & Control',
  '/assistant': 'AI Assistant',
  '/reports': 'Reports',
};

export default function Topbar() {
  const path = usePathname();
  const key = Object.keys(TITLES).find((k) => (k === '/' ? path === '/' : path.startsWith(k))) || '/';
  return (
    <header className="topbar">
      <h1>{TITLES[key]}</h1>
      <div className="spacer" />
      <div className="ai-btn">✨ AI Assistant</div>
      <div className="icon-btn" title="Notifications">🔔</div>
      <div className="icon-btn" title="Settings">⚙</div>
      <div className="icon-btn" title="Profile">👤</div>
    </header>
  );
}
