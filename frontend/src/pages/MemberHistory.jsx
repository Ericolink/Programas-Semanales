import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberHistory } from '../api/api.js';

const SECTION_COLORS = {
  'Apertura':                'var(--text-2)',
  'Tesoros de la Biblia':    'var(--warning)',
  'Seamos Mejores Maestros': '#d97706',
  'Nuestra Vida Cristiana':  'var(--danger)',
  'Cierre':                  'var(--text-2)',
};

const ROLE_COLORS = {
  'Anciano':     '#fbbf24',
  'Ministerial': 'var(--accent)',
  'Publicador':  'var(--text-2)',
};

export default function MemberHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberHistory(id)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>;
  if (!data)   return <div style={{ color: 'var(--danger)' }}>Miembro no encontrado</div>;

  const { member, assignments } = data;

  // Agrupar por semana
  const byWeek = assignments.reduce((acc, a) => {
    const key = a.week.id;
    if (!acc[key]) acc[key] = { week: a.week, parts: [] };
    acc[key].parts.push(a);
    return acc;
  }, {});

  // Conteo por tipo de asignación
  const countByType = assignments
    .filter(a => !a.isHelper)
    .reduce((acc, a) => {
      const name = a.customName || a.assignmentType.name;
      const clean = name.replace(/\s+\d+$/, '');
      acc[clean] = (acc[clean] ?? 0) + 1;
      return acc;
    }, {});

  const topParts = Object.entries(countByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <button onClick={() => navigate('/miembros')} style={{
        background: 'none', border: 'none', color: 'var(--text-2)',
        cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0,
      }}>
        ← Volver a miembros
      </button>

      {/* Info del miembro */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: member.gender === 'H' ? 'rgba(79,124,255,0.15)' : 'rgba(124,79,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700,
          color: member.gender === 'H' ? 'var(--accent)' : 'var(--accent-2)',
        }}>
          {member.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>{member.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {member.role && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                background: `${ROLE_COLORS[member.role.name] ?? 'var(--text-2)'}22`,
                color: ROLE_COLORS[member.role.name] ?? 'var(--text-2)',
              }}>
                {member.role.name}
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
              background: 'rgba(139,144,167,0.15)', color: 'var(--text-2)',
            }}>
              {member.gender === 'H' ? 'Hermano' : 'Hermana'}
            </span>
            {member.group && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                background: 'rgba(139,144,167,0.15)', color: 'var(--text-2)',
              }}>
                {member.group.name}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontFamily: 'DM Serif Display', color: 'var(--accent)' }}>
            {assignments.filter(a => !a.isHelper).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>partes principales</div>
        </div>
      </div>

      {/* Partes más frecuentes */}
      {topParts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Partes más frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topParts.map(([name, count]) => (
              <div key={name} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13 }}>{name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                  background: 'rgba(79,124,255,0.1)', borderRadius: 6, padding: '3px 10px',
                }}>
                  {count} {count === 1 ? 'vez' : 'veces'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial por semana */}
      <h2 style={{ fontSize: 18, marginBottom: 14 }}>Historial por semana</h2>

      {Object.keys(byWeek).length === 0 ? (
        <div style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Este miembro no tiene asignaciones registradas aún.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(byWeek).map(({ week, parts }) => (
            <div key={week.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 20px', borderBottom: '1px solid var(--border)',
                fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                Semana del {new Date(week.startDate).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
              <div>
                {parts.map((a, idx) => {
                  const name = a.customName || a.assignmentType.name;
                  const clean = name.replace(/\s+\d+$/, '');
                  const sectionColor = SECTION_COLORS[a.assignmentType.section] ?? 'var(--text-2)';
                  return (
                    <div key={a.id} style={{
                      padding: '10px 20px',
                      borderBottom: idx < parts.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 3, height: 16, borderRadius: 2,
                        background: sectionColor, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{clean}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>
                          {a.assignmentType.section}
                        </div>
                      </div>
                      {a.isHelper && (
                        <span style={{
                          fontSize: 11, color: 'var(--text-2)', background: 'var(--bg)',
                          border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px',
                        }}>
                          Ayudante
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}