import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWeekById, generateAssignments, getMembers,
  updateAssignmentMember, updateAssignmentType, getAssignmentTypes
} from '../api/api.js';
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/useAuth.js';

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

function getDisplayName(assignment, allAssignments) {
  const name = assignment.customName || assignment.assignmentType.name;
  const section = assignment.assignmentType.section;

  const noNumber = ['Apertura', 'Cierre'];
  if (noNumber.includes(section)) return name;
  if (assignment.assignmentType.name === 'Presidente') return name;

  const cleanName = name.replace(/\s+\d+$/, '');

  const numbered = allAssignments
    .filter(a =>
      !a.isHelper &&
      !noNumber.includes(a.assignmentType.section) &&
      a.assignmentType.name !== 'Presidente'
    )
    .sort((a, b) => a.assignmentType.order - b.assignmentType.order);

  const index = numbered.findIndex(a => a.assignmentTypeId === assignment.assignmentTypeId);
  const num = index + 1;

  return `${num}. ${cleanName}`;
}

function ProgramaImprimible({ week, sections, dateStr, getPairs, allAssignments, congregationName }) {
    return (
    <div style={{
      background: '#ffffff', width: 600,
      fontFamily: 'Arial, sans-serif', color: '#1a1a1a', padding: 0,
    }}>
      <div style={{
        background: '#1a3a5c', color: '#ffffff', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 2 }}>
            {congregationName.toUpperCase()}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            Programa para la reunión de entre semana
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
          {dateStr.toUpperCase()}
        </div>
      </div>

      {SECTION_ORDER.map(sectionName => {
        const items = sections[sectionName];
        if (!items || items.length === 0) return null;
        const style = SECTION_STYLES[sectionName];
        const pairs = getPairs(items);
        const isAperturaCierre = sectionName === 'Apertura' || sectionName === 'Cierre';

        return (
          <div key={sectionName}>
            {!isAperturaCierre && (
              <div style={{ background: style.bg, padding: '6px 24px', borderTop: '2px solid #e5e7eb' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: style.color }}>
                  {style.label}
                </span>
              </div>
            )}
            {pairs.map(({ principal, helper }) => (
              <div key={principal.id} style={{
                padding: '8px 24px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                background: isAperturaCierre ? '#f9fafb' : '#ffffff',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4, color: '#1a1a1a' }}>
                    {getDisplayName(principal, allAssignments)}
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
            ))}
          </div>
        );
      })}

      <div style={{
        background: '#1a3a5c', color: 'rgba(255,255,255,0.6)',
        padding: '8px 24px', fontSize: 10, textAlign: 'center',
      }}>
        Vida y Ministerio Cristianos
      </div>
    </div>
  );
}

export default function Semana() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const { user } = useAuth();
  const congregationName = user?.congregation?.name ?? 'Congregación';

  const [week, setWeek]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [generating, setGenerating]           = useState(false);
  const [exporting, setExporting]             = useState(false);
  const [members, setMembers]                 = useState([]);
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [editingMember, setEditingMember]     = useState(null);
  const [editingType, setEditingType]         = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedTypeId, setSelectedTypeId]     = useState('');
  const [customNameInput, setCustomNameInput]   = useState('');
  const [saving, setSaving]                   = useState(false);

  const fetchWeek = () => {
    setLoading(true);
    getWeekById(id).then(r => setWeek(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeek();
    getMembers().then(r => setMembers(r.data));
    getAssignmentTypes().then(r => setAssignmentTypes(r.data));
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try { await generateAssignments(id); fetchWeek(); }
    finally { setGenerating(false); }
  };

  const handleSaveMember = async () => {
    if (!selectedMemberId) return;
    setSaving(true);
    try {
      await updateAssignmentMember(editingMember.id, Number(selectedMemberId));
      setEditingMember(null);
      fetchWeek();
    } finally { setSaving(false); }
  };

  const handleSaveType = async () => {
    if (!selectedTypeId) return;
    setSaving(true);
    try {
      await updateAssignmentType(editingType.id, Number(selectedTypeId), customNameInput || null);
      setEditingType(null);
      fetchWeek();
    } finally { setSaving(false); }
  };

  const handleExport = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      });
      const link = document.createElement('a');
      link.download = `programa-${dateStr.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setExporting(false); }
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

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 800 }}>

      {/* Modal: Cambiar miembro */}
      {editingMember && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 420,
          }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Cambiar miembro</h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              {getDisplayName(editingMember, week.assignments)}
              {editingMember.isHelper && (
                <span style={{ color: 'var(--text-2)', marginLeft: 6 }}>(ayudante)</span>
              )}
            </p>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
              Seleccionar miembro
            </label>
            <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} style={inputStyle}>
              <option value="">— Seleccionar —</option>
              {members
                .filter(m => m.active)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.role ? `(${m.role.name})` : ''}
                  </option>
                ))
              }
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingMember(null)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSaveMember} disabled={saving || !selectedMemberId} style={{
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: saving || !selectedMemberId ? 'not-allowed' : 'pointer',
                opacity: saving || !selectedMemberId ? 0.6 : 1,
              }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar tipo de asignación */}
      {editingType && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 440,
          }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Cambiar asignación</h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              Actual: {getDisplayName(editingType, week.assignments)}
            </p>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
              Nueva asignación
            </label>
            <select value={selectedTypeId} onChange={e => setSelectedTypeId(e.target.value)}
              style={{ ...inputStyle, marginBottom: 14 }}>
              <option value="">— Seleccionar —</option>
              {assignmentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.section})</option>
              ))}
            </select>
            <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>
              Título personalizado (opcional)
            </label>
            <input
              value={customNameInput}
              onChange={e => setCustomNameInput(e.target.value)}
              placeholder="Ej: Discurso especial de circuito"
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingType(null)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 18px', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer',
              }}>Cancelar</button>
              <button onClick={handleSaveType} disabled={saving || !selectedTypeId} style={{
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: saving || !selectedTypeId ? 'not-allowed' : 'pointer',
                opacity: saving || !selectedTypeId ? 0.6 : 1,
              }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
            background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px 20px', fontSize: 14, fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting || week.assignments.length === 0 ? 0.6 : 1,
          }}>
            {exporting ? 'Exportando...' : '📷 Exportar imagen'}
          </button>
          <button onClick={handleGenerate} disabled={generating} style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
            padding: '12px 20px', fontSize: 14, fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1,
          }}>
            {generating ? 'Generando...' : '⚡ Generar'}
          </button>
        </div>
      </div>

      {/* Vista oscura del programa */}
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
                    display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                      {getDisplayName(principal, week.assignments)}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{principal.member.name}</span>
                        <button
                          onClick={() => {
                            setEditingMember(principal);
                            setSelectedMemberId(String(principal.memberId));
                          }}
                          title="Cambiar miembro"
                          style={{
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: 5, padding: '2px 6px', color: 'var(--text-2)',
                            fontSize: 11, cursor: 'pointer',
                          }}
                        >👤</button>
                      </div>
                      {helper && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>/ {helper.member.name}</span>
                          <button
                            onClick={() => {
                              setEditingMember(helper);
                              setSelectedMemberId(String(helper.memberId));
                            }}
                            title="Cambiar ayudante"
                            style={{
                              background: 'transparent', border: '1px solid var(--border)',
                              borderRadius: 5, padding: '2px 6px', color: 'var(--text-2)',
                              fontSize: 11, cursor: 'pointer',
                            }}
                          >👤</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          setEditingType(principal);
                          setSelectedTypeId(String(principal.assignmentTypeId));
                          setCustomNameInput(principal.customName ?? '');
                        }}
                        title="Cambiar asignación"
                        style={{
                          background: 'transparent', border: '1px solid var(--border)',
                          borderRadius: 5, padding: '3px 7px', color: 'var(--text-2)',
                          fontSize: 11, cursor: 'pointer',
                        }}
                      >✏️</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Versión blanca para exportar (oculta) */}
      <div style={{ position: 'absolute', left: -9999, top: 0, zIndex: -1 }}>
        <div ref={printRef}>
          <ProgramaImprimible
            week={week}
            sections={sections}
            dateStr={dateStr}
            getPairs={getPairs}
            allAssignments={week.assignments}
            congregationName={congregationName}
          />
        </div>
      </div>
    </div>
  );
}