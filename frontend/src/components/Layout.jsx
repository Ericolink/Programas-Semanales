import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/',         label: 'Dashboard',  icon: '⬡' },
  { to: '/semanas',  label: 'Semanas',    icon: '📅' },
  { to: '/miembros', label: 'Miembros',   icon: '👥' },
  { to: '/grupos',   label: 'Grupos',     icon: '🏷️' },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '32px 0', position: 'sticky',
        top: 0, height: '100vh', flexShrink: 0,
      }}>
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 20, color: 'var(--accent)' }}>
            Vida y
          </div>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 20 }}>
            Ministerio
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-2)',
            })}>
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 24px', fontSize: 12, color: 'var(--text-2)' }}>
          Congregación
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}