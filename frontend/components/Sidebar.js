'use client';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Dashboard', ico: '▦' },
  { href: '/part', label: 'Part & 3D Model', ico: '◈' },
  { href: '/operations', label: 'Operations', ico: '☰' },
  { href: '/cnc', label: 'CNC Programming', ico: '⌘' },
  { href: '/tools', label: 'Tool Library', ico: '🛠' },
  { href: '/optimization', label: 'Tool Optimization', ico: '✦' },
  { href: '/calculator', label: 'Cutting Calculator', ico: '🧮' },
  { href: '/ppc', label: 'PPC Planning', ico: '📅' },
  { href: '/assistant', label: 'AI Assistant', ico: '✨' },
  { href: '/reports', label: 'Reports', ico: '📄' },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">A</div>
        <div>
          <div className="brand-name">ASET TRONICS</div>
          <div className="brand-sub">Engineering &amp; Software Solutions</div>
        </div>
      </div>

      <button className="new-project" onClick={() => router.push('/ppc')}>+ New Project</button>

      <nav className="nav">
        {NAV.map((n) => {
          const active = n.href === '/' ? path === '/' : path.startsWith(n.href);
          return (
            <div
              key={n.href}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => router.push(n.href)}
            >
              <span className="ico">{n.ico}</span>
              <span>{n.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="big">◭ ASET TRONICS</div>
        <div>AI Powered Manufacturing Excellence</div>
      </div>
    </aside>
  );
}
