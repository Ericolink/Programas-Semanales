import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeekById, generateAssignments } from '../api/api.js';

const SECTION_COLORS = {
  'Apertura':               'var(--accent)',
  'Tesoros de la Biblia':   'var(--warning)',
  'Seamos Mejores Maestros':'var(--success)',
  'Nuestra Vida Cristiana': 'var(--accent-2)',
  'Cierre':                 'var(--text-2)',
};

function groupBySection(assignments) {
  return assignments.reduce((acc, a) => {
    const s = a.assignmentType.section;
    if (!acc[s]) acc[s] = [];
    acc[s].push(a);
    return acc;
  }, {});
}

export default function Semana() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [week, setWeek]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchWeek = () => {
    getWeekById(id).then(r => setWeek(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWeek(); }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateAssignments(id);
      fetchWeek();
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>;
  if (!week)   return <div style={{ color: 'var(--danger)' }}>Semana no encontrada</div>;

  const sections = groupBySection(week.assignments);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button
            onClick={() => navigate('/semanas')}
            style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, marginBottom: 8, padding: 0 }}
          >
            ← Volver
          </button>
          <h1 style={{ fontSize: 28 }}>
            Semana del {new Date(week.startDate).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
            {week.assignments.length} asignaciones en total
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px 24px', fontSize: 14,
            fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? 'Generando...' : '⚡ Generar asignaciones'}
        </button>
      </div>

      {/* Sin asignaciones */}
      {week.assignments.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 32, textAlign: 'center',
          color: 'var(--text-2)', fontSize: 14,
        }}>
          No hay asignaciones generadas. Presiona "Generar asignaciones" para comenzar.
        </div>
      )}

      {/* Secciones */}
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          }}>
            <div style={{
              width: 4, height: 20, borderRadius: 2,
              background: SECTION_COLORS[section] ?? 'var(--accent)',
            }} />
            <h2 style={{ fontSize: 16, fontFamily: 'DM Sans', fontWeight: 600 }}>{section}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(a => (
              <div key={a.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {a.assignmentType.name}
                    {a.isHelper && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, background: 'var(--bg)',
                        border: '1px solid var(--border)', borderRadius: 4,
                        padding: '2px 6px', color: 'var(--text-2)',
                      }}>Ayudante</span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize: 13, color: 'var(--accent)', fontWeight: 500,
                  background: 'rgba(79,124,255,0.1)', borderRadius: 6,
                  padding: '4px 10px',
                }}>
                  {a.member.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}