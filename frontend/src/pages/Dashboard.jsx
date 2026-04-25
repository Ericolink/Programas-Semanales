import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeks, getMembers, getGroups } from '../api/api.js';

function StatCard({ label, value, color = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '24px 28px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 36, fontFamily: 'DM Serif Display', color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [weeks, setWeeks]     = useState([]);
  const [members, setMembers] = useState([]);
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getWeeks(), getMembers(), getGroups()])
      .then(([w, m, g]) => {
        setWeeks(w.data);
        setMembers(m.data);
        setGroups(g.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>
  );

  const lastWeek = weeks[0];
  const activeMembers = members.filter(m => m.active).length;

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 14 }}>
        Resumen general de la congregación
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Miembros activos"  value={activeMembers}  color="var(--accent)" />
        <StatCard label="Grupos"            value={groups.length}  color="var(--accent-2)" />
        <StatCard label="Semanas importadas" value={weeks.length}  color="var(--success)" />
      </div>

      {/* Última semana */}
      {lastWeek && (
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Última semana importada</h2>
          <div
            onClick={() => navigate(`/semanas/${lastWeek.id}`)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
              cursor: 'pointer', transition: 'background 0.15s',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <div>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 18 }}>
                Semana del {new Date(lastWeek.startDate).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
                {lastWeek._count?.assignments ?? 0} asignaciones generadas
              </div>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 20 }}>→</span>
          </div>
        </div>
      )}

      {/* Semanas recientes */}
      {weeks.length > 1 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, marginBottom: 16 }}>Semanas anteriores</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weeks.slice(1, 5).map(w => (
              <div
                key={w.id}
                onClick={() => navigate(`/semanas/${w.id}`)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '14px 20px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
              >
                <span style={{ fontSize: 14 }}>
                  {new Date(w.startDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {w._count?.assignments ?? 0} asignaciones
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}