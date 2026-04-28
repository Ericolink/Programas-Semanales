import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeekById, generateAssignments } from '../api/api.js';
import html2canvas from 'html2canvas';

const SECTION_STYLES = {
  'Apertura':                { color: '#6b7280', bg: '#f3f4f6', label: 'APERTURA' },
  'Tesoros de la Biblia':    { color: '#92400e', bg: '#fef3c7', label: 'TESOROS DE LA BIBLIA' },
  'Seamos Mejores Maestros': { color: '#78350f', bg: '#fde68a', label: 'SEAMOS MEJORES MAESTROS' },
  'Nuestra Vida Cristiana':  { color: '#7f1d1d', bg: '#fee2e2', label: 'NUESTRA VIDA CRISTIANA' },
  'Cierre':                  { color: '#6b7280', bg: '#f3f4f6', label: 'CIERRE' },
};

const SECTION_ORDER = [
  'Apertura',
  'Tesoros de la Biblia',
  'Seamos Mejores Maestros',
  'Nuestra Vida Cristiana',
  'Cierre',
];

function groupBySection(assignments) {
  const grouped = {};
  for (const a of assignments) {
    const s = a.assignmentType.section;
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(a);
  }
  return grouped;
}

function getDisplayName(assignment) {
  return assignment.customName || assignment.assignmentType.name;
}

// ── Componente del programa imprimible ────────────────────────────────────
function ProgramaImprimible({ week, sections, dateStr, getPairs }) {
  return (
    <div style={{
      background: '#ffffff',
      width: 600,
      fontFamily: 'Arial, sans-serif',
      color: '#1a1a1a',
      padding: 0,
    }}>
      {/* Encabezado */}
      <div style={{
        background: '#1a3a5c',
        color: '#ffffff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 2 }}>
            CONGREGACIÓN FELIPE ÁNGELES
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            Programa para la reunión de entre semana
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
          {dateStr.toUpperCase()}
        </div>
      </div>

      {/* Secciones */}
      {SECTION_ORDER.map(sectionName => {
        const items = sections[sectionName];
        if (!items || items.length === 0) return null;
        const style = SECTION_STYLES[sectionName];
        const pairs = getPairs(items);
        const isAperturaCierre = sectionName === 'Apertura' || sectionName === 'Cierre';

        return (
          <div key={sectionName}>
            {/* Header de sección */}
            {!isAperturaCierre && (
              <div style={{
                background: style.bg,
                padding: '6px 24px',
                borderTop: '2px solid #e5e7eb',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', color: style.color,
                }}>
                  {style.label}
                </span>
              </div>
            )}

            {pairs.map(({ principal, helper }, idx) => {
              const isSection = sectionName === 'Apertura' || sectionName === 'Cierre';
              return (
                <div key={principal.id} style={{
                  padding: '8px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: isSection ? '#f9fafb' : '#ffffff',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4, color: '#1a1a1a' }}>
                      {getDisplayName(principal)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, maxWidth: 220 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>
                      {principal.member.name}
                    </div>
                    {helper && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                        / {helper.member.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        background: '#1a3a5c', color: 'rgba(255,255,255,0.6)',
        padding: '8px 24px', fontSize: 10, textAlign: 'center',
      }}>
        Vida y Ministerio Cristianos
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────
export default function Semana() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [week, setWeek]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting]   = useState(false);

  const fetchWeek = () => {
    setLoading(true);
    getWeekById(id).then(r => setWeek(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWeek(); }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try { await generateAssignments(id); fetchWeek(); }
    finally { setGenerating(false); }
  };

  const handleExport = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `programa-${dateStr.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-2)', fontSize: 14 }}>Cargando...</div>;
  if (!week)   return <div style={{ color: 'var(--danger)' }}>Semana no encontrada</div>;

  const sections = groupBySection(week.assignments);
  const dateStr = new Date(week.startDate).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  function getPairs(items) {
    const principals = items.filter(a => !a.isHelper);
    const helpers    = items.filter(a => a.isHelper);
    return principals.map(p => ({
      principal: p,
      helper: helpers.find(h => h.assignmentTypeId === p.assignmentTypeId) ?? null,
    }));
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header de la página */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button onClick={() => navigate('/semanas')} style={{
            background: 'none', border: 'none', color: 'var(--text-2)',
            cursor: 'pointer', fontSize: 13, marginBottom: 8, padding: 0,
          }}>
            ← Volver
          </button>
          <h1 style={{ fontSize: 28 }}>Semana del {dateStr}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
            {week.assignments.filter(a => !a.isHelper).length} asignaciones principales
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExport} disabled={exporting || week.assignments.length === 0} style={{
            background: 'var(--success)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px 20px', fontSize: 14,
            fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting || week.assignments.length === 0 ? 0.6 : 1,
          }}>
            {exporting ? 'Exportando...' : '📷 Exportar imagen'}
          </button>
          <button onClick={handleGenerate} disabled={generating} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px 20px', fontSize: 14,
            fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}>
            {generating ? 'Generando...' : '⚡ Generar'}
          </button>
        </div>
      </div>

      {/* Vista oscura del programa en la app */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 40,
      }}>
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'DM Serif Display', fontSize: 18 }}>Programa de entre semana</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{dateStr}</div>
        </div>

        {week.assignments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
            No hay asignaciones. Presiona "Generar" para comenzar.
          </div>
        ) : (
          SECTION_ORDER.map(sectionName => {
            const items = sections[sectionName];
            if (!items || items.length === 0) return null;
            const style = SECTION_STYLES[sectionName];
            const pairs = getPairs(items);

            return (
              <div key={sectionName}>
                <div style={{
                  borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                  padding: '7px 28px', display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ width: 3, height: 14, borderRadius: 2, background: style.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: style.color }}>
                    {style.label}
                  </span>
                </div>
                {pairs.map(({ principal, helper }, idx) => (
                  <div key={principal.id} style={{
                    padding: '11px 28px',
                    borderBottom: idx < pairs.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                      {getDisplayName(principal)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{principal.member.name}</div>
                      {helper && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>/ {helper.member.name}</div>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Versión blanca para exportar — oculta visualmente pero renderizada */}
      <div style={{ position: 'absolute', left: -9999, top: 0, zIndex: -1 }}>
        <div ref={printRef}>
          <ProgramaImprimible
            week={week}
            sections={sections}
            dateStr={dateStr}
            getPairs={getPairs}
          />
        </div>
      </div>
    </div>
  );
}