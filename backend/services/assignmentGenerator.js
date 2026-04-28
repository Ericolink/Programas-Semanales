import { prisma } from '../prismaClient.js';

const WEEKS_LOOKBACK = 4;

const isAnciano     = m => m.role?.name === 'Anciano';
const isMinisterial = m => m.role?.name === 'Ministerial';
const isPublicador  = m => m.role?.name === 'Publicador';
const isPrivileged  = m => isAnciano(m) || isMinisterial(m);
const isH           = m => m.gender === 'H';
const isM           = m => m.gender === 'M';

export async function generateAssignments(weekId, congregationId) {

  // Obtener semana (FIX agregado)
  const week = await prisma.week.findUnique({
    where: { id: weekId },
  });

  if (!week) throw new Error('Semana no encontrada');

  // Filtra miembros por congregación
  const members = await prisma.member.findMany({
    where: { active: true, congregationId },
    include: { role: true },
  });

  const assignmentTypes = await prisma.assignmentType.findMany({
    orderBy: { order: 'asc' },
  });

  // Obtener customNames de esta semana
  const weekTypes = await prisma.weekAssignmentType.findMany({
    where: { weekId },
  });

  const customNameMap = new Map(
    weekTypes.map(wt => [wt.assignmentTypeId, wt.customName])
  );

  // Solo usar los tipos que pertenecen a esta semana
  const weekTypeIds = new Set(weekTypes.map(wt => wt.assignmentTypeId));
  const weekAssignmentTypes = assignmentTypes.filter(t => weekTypeIds.has(t.id));

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
  const used = new Set();

  function pick(candidates, typeId, extraExclude = new Set(), ignoreRecent = false) {
    const excluded = new Set([...used, ...extraExclude]);
    const available = candidates.filter(m => {
      if (excluded.has(m.id)) return false;
      if (ignoreRecent) return true;
      const recent = recentMap.get(m.id);
      return !recent || !recent.has(typeId);
    });

    if (available.length === 0) {
      const relaxed = candidates.filter(m => !excluded.has(m.id));
      if (relaxed.length === 0) return null;
      return relaxed.sort((a, b) =>
        (recentMap.get(a.id)?.size ?? 0) - (recentMap.get(b.id)?.size ?? 0)
      )[0];
    }

    return available.sort((a, b) =>
      (recentMap.get(a.id)?.size ?? 0) - (recentMap.get(b.id)?.size ?? 0)
    )[0];
  }

  function assign(memberId, typeId, isHelper = false) {
    assignments.push({
      memberId,
      assignmentTypeId: typeId,
      weekId,
      isHelper,
      customName: customNameMap.get(typeId) ?? null,
    });
    if (!isHelper) used.add(memberId);
  }

  const privilegedH  = members.filter(m => isPrivileged(m) && isH(m));
  const ancianosH    = members.filter(m => isAnciano(m) && isH(m));
  const mujeres      = members.filter(m => isM(m));
  const publicadores = members.filter(m => isPublicador(m));
  const todosH       = members.filter(m => isH(m));

  // ── Presidente ────────────────────────────────────────────────────────────
  const tipoIntro      = weekAssignmentTypes.find(t => t.name === 'Palabras de introducción');
  const tipoConclusion = weekAssignmentTypes.find(t => t.name === 'Palabras de conclusión');
  const tipoPresidente = await prisma.assignmentType.findFirst({ where: { name: 'Presidente' } });

  let presidenteId = null;
  if (tipoIntro) {
    const presidente = pick(privilegedH, tipoIntro.id);
    if (presidente) {
      presidenteId = presidente.id;
      used.add(presidenteId);
      assign(presidenteId, tipoIntro.id);

      if (tipoPresidente) {
        assignments.push({
          memberId: presidenteId,
          assignmentTypeId: tipoPresidente.id,
          weekId,
          isHelper: false,
          customName: null,
        });
      }
    }
  }

  if (tipoConclusion && presidenteId) {
    assign(presidenteId, tipoConclusion.id);
  }

  // ── Oración apertura ──────────────────────────────────────────────────────
  const tipoOrApertura = weekAssignmentTypes.find(t => t.name === 'Canción y oración de apertura');
  if (tipoOrApertura) {
    const orador = pick(privilegedH, tipoOrApertura.id);
    if (orador) assign(orador.id, tipoOrApertura.id);
  }

  // ── Oración cierre ────────────────────────────────────────────────────────
  const tipoOrCierre = weekAssignmentTypes.find(t => t.name === 'Oración de cierre');
  if (tipoOrCierre) {
    const orador = pick(privilegedH, tipoOrCierre.id);
    if (orador) assign(orador.id, tipoOrCierre.id);
  }

  // ── Tesoros pt 1 ──────────────────────────────────────────────────────────
  const tipoTesoros1 = weekAssignmentTypes.find(t =>
    t.name === 'Discurso de Tesoros de la Biblia'
  );
  if (tipoTesoros1) {
    const orador = pick(privilegedH, tipoTesoros1.id);
    if (orador) assign(orador.id, tipoTesoros1.id);
  }

  // ── Tesoros pt 2 ──────────────────────────────────────────────────────────
  const tipoPerlas = weekAssignmentTypes.find(t => t.name === 'Busquemos perlas escondidas');
  if (tipoPerlas) {
    const orador = pick(privilegedH, tipoPerlas.id);
    if (orador) assign(orador.id, tipoPerlas.id);
  }

  // ── Lectura ───────────────────────────────────────────────────────────────
  const tipoLectura = weekAssignmentTypes.find(t => t.name === 'Lectura de la Biblia');
  if (tipoLectura) {
    const candidatos = members.filter(m => isPublicador(m) && isH(m));
    const lector = pick(candidatos.length > 0 ? candidatos : todosH, tipoLectura.id);
    if (lector) assign(lector.id, tipoLectura.id);
  }

  // ── Seamos Mejores Maestros ───────────────────────────────────────────────
  const smmTypes = weekAssignmentTypes.filter(t => t.section === 'Seamos Mejores Maestros');

  for (const type of smmTypes) {
    const isDiscurso = /^discurso/i.test(type.name);

    if (isDiscurso) {
      const prioridad = publicadores.filter(m => !used.has(m.id));
      const candidatos = prioridad.length > 0 ? prioridad : members;
      const orador = pick(candidatos, type.id);
      if (orador) assign(orador.id, type.id);
    } else {
      const principal = pick(mujeres, type.id);
      if (principal) assign(principal.id, type.id);

      if (type.requiresHelper) {
        const ayudante = pick(mujeres, type.id, new Set([principal?.id ?? 0]));
        if (ayudante) {
          assign(ayudante.id, type.id, true);
          used.add(ayudante.id);
        }
      }
    }
  }

  // ── Nuestra Vida Cristiana ────────────────────────────────────────────────
  const nvcTypes = weekAssignmentTypes.filter(t =>
    t.section === 'Nuestra Vida Cristiana' &&
    t.name !== 'Estudio bíblico de la congregación'
  );

  for (const type of nvcTypes) {
    const orador = pick(ancianosH, type.id);
    if (orador) assign(orador.id, type.id);
  }

  // ── Estudio bíblico ───────────────────────────────────────────────────────
  const tipoEstudio = weekAssignmentTypes.find(t => t.name === 'Estudio bíblico de la congregación');

  if (tipoEstudio) {
    const conductor = pick(privilegedH, tipoEstudio.id);
    if (conductor) {
      assign(conductor.id, tipoEstudio.id);
      const lector = pick(todosH, tipoEstudio.id, new Set([conductor.id]));
      if (lector) assign(lector.id, tipoEstudio.id, true);
    }
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  await prisma.assignmentDone.createMany({ data: assignments });

  return prisma.week.findUnique({
    where: { id: weekId },
    include: {
      weekTypes: {
        include: { assignmentType: true },
        orderBy: { assignmentType: { order: 'asc' } },
      },
      assignments: {
        include: { member: true, assignmentType: true },
        orderBy: { assignmentType: { order: 'asc' } },
      },
    },
  });
}