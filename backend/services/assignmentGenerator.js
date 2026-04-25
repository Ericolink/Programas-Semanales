import { prisma } from '../prismaClient.js';

const WEEKS_LOOKBACK = 4;
const PRIVILEGED_ROLES = ['Anciano', 'Ministerial'];

// Partes del presidente — misma persona en toda la reunión
const PRESIDENT_PART_NAMES = [
  'Canción y oración de apertura',
  'Palabras de introducción',
  'Palabras de conclusión',
  'Oración de cierre',
];

// Secciones y partes que requieren rol privilegiado
const PRIVILEGED_SECTIONS = ['Apertura', 'Cierre'];
const PRIVILEGED_PART_NAMES = [
  'Busquemos perlas escondidas',
  'Estudio bíblico de la congregación',
];

// El primer discurso de Tesoros de la Biblia siempre es privilegiado
// Lo detectamos por sección + order <= 2
function isPrivilegedType(type) {
  if (PRIVILEGED_SECTIONS.includes(type.section)) return true;
  if (PRIVILEGED_PART_NAMES.includes(type.name)) return true;
  // Primer discurso de Tesoros (order 2) — título cambia cada semana
  if (type.section === 'Tesoros de la Biblia' && type.order === 2) return true;
  return false;
}

function isPresidentPart(type) {
  return PRESIDENT_PART_NAMES.includes(type.name);
}

export async function generateAssignments(weekId) {
  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw new Error('Semana no encontrada');

  const assignmentTypes = await prisma.assignmentType.findMany({
    orderBy: { order: 'asc' },
  });

  const members = await prisma.member.findMany({
    where: { active: true },
    include: { role: true },
  });

  const recentWeeks = await prisma.week.findMany({
    where: { startDate: { lt: week.startDate } },
    orderBy: { startDate: 'desc' },
    take: WEEKS_LOOKBACK,
    select: { id: true },
  });

  const recentAssignments = await prisma.assignmentDone.findMany({
    where: { weekId: { in: recentWeeks.map(w => w.id) } },
    select: { memberId: true, assignmentTypeId: true },
  });

  const recentMap = new Map();
  for (const a of recentAssignments) {
    if (!recentMap.has(a.memberId)) recentMap.set(a.memberId, new Set());
    recentMap.get(a.memberId).add(a.assignmentTypeId);
  }

  await prisma.assignmentDone.deleteMany({ where: { weekId } });

  const assignments = [];
  const usedMemberIds = new Set();
  let presidentId = null;

  for (const type of assignmentTypes) {
    const privileged = isPrivilegedType(type);
    const presidentPart = isPresidentPart(type);

    // --- Partes del presidente ---
    if (presidentPart) {
      if (!presidentId) {
        const candidates = members.filter(m =>
          m.gender === 'H' && m.role && PRIVILEGED_ROLES.includes(m.role.name)
        );
        const selected = selectMember(candidates, type.id, recentMap, new Set());
        if (selected) presidentId = selected.id;
      }
      if (presidentId) {
        assignments.push({ memberId: presidentId, assignmentTypeId: type.id, weekId, isHelper: false });
      }
      continue;
    }

    // --- Filtrar por género ---
    let candidates = members.filter(m => {
      if (type.gender === 'H') return m.gender === 'H';
      if (type.gender === 'M') return m.gender === 'M';
      return true;
    });

    // --- Filtrar por rol si es privilegiada ---
    if (privileged) {
      candidates = candidates.filter(m =>
        m.role && PRIVILEGED_ROLES.includes(m.role.name)
      );
    }

    // Excluir presidente y miembros ya usados
    const excluded = new Set([...usedMemberIds]);
    if (presidentId) excluded.add(presidentId);

    let selected = selectMember(candidates, type.id, recentMap, excluded);
    if (!selected) selected = selectMember(candidates, type.id, recentMap, excluded, true);
    if (!selected) selected = candidates.find(m => !excluded.has(m.id)) ?? candidates[0] ?? null;

    if (!selected) continue;

    usedMemberIds.add(selected.id);
    assignments.push({ memberId: selected.id, assignmentTypeId: type.id, weekId, isHelper: false });

    // --- Ayudante ---
    if (type.requiresHelper) {
      const helperCandidates = members.filter(m => {
        if (type.gender === 'H') return m.gender === 'H';
        if (type.gender === 'M') return m.gender === 'M';
        return true;
      });

      const helperExcluded = new Set([selected.id, ...usedMemberIds]);
      let helper = selectMember(helperCandidates, type.id, recentMap, helperExcluded);
      if (!helper) helper = selectMember(helperCandidates, type.id, recentMap, helperExcluded, true);
      if (!helper) helper = helperCandidates.find(m => !helperExcluded.has(m.id)) ?? null;

      if (helper) {
        assignments.push({ memberId: helper.id, assignmentTypeId: type.id, weekId, isHelper: true });
      }
    }
  }

  await prisma.assignmentDone.createMany({ data: assignments });

  return prisma.week.findUnique({
    where: { id: weekId },
    include: {
      assignments: {
        include: { member: true, assignmentType: true },
        orderBy: { assignmentType: { order: 'asc' } },
      },
    },
  });
}

function selectMember(candidates, assignmentTypeId, recentMap, excludedIds, ignoreRecent = false) {
  const available = candidates.filter(m => {
    if (excludedIds.has(m.id)) return false;
    if (ignoreRecent) return true;
    const recent = recentMap.get(m.id);
    return !recent || !recent.has(assignmentTypeId);
  });

  if (available.length === 0) return null;

  available.sort((a, b) => {
    const aCount = recentMap.get(a.id)?.size ?? 0;
    const bCount = recentMap.get(b.id)?.size ?? 0;
    return aCount - bCount;
  });

  return available[0];
}