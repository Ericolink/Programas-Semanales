import { scrapeWeek } from '../services/weekScraper.js';
import { prisma } from '../prismaClient.js';
import { generateAssignments } from '../services/assignmentGenerator.js';

export async function importWeek(req, res) {
  try {
    const { docId } = req.body;
    if (!docId) return res.status(400).json({ error: 'docId es requerido' });

    const { startDate, partes } = await scrapeWeek(docId);

    const week = await prisma.week.upsert({
      where: { startDate },
      update: {},
      create: { startDate },
    });

    for (const parte of partes) {
      await prisma.assignmentType.upsert({
        where: { name: parte.name },
        update: {},
        create: {
          name: parte.name,
          section: parte.section,
          gender: parte.gender,
          order: parte.order,
          requiresHelper: parte.requiresHelper,
        },
      });
    }

    res.json({ ok: true, week, partes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getWeeks(req, res) {
  try {
    const weeks = await prisma.week.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { assignments: true } },
      },
    });
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWeekById(req, res) {
  try {
    const week = await prisma.week.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        assignments: {
          include: {
            member: true,
            assignmentType: true,
          },
          orderBy: { assignmentType: { order: 'asc' } },
        },
      },
    });
    if (!week) return res.status(404).json({ error: 'Semana no encontrada' });
    res.json(week);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAssignment(req, res) {
  try {
    const { memberId, assignmentTypeId, isHelper } = req.body;
    const weekId = Number(req.params.id);

    if (!memberId || !assignmentTypeId)
      return res.status(400).json({ error: 'memberId y assignmentTypeId son requeridos' });

    const assignment = await prisma.assignmentDone.upsert({
      where: {
        memberId_assignmentTypeId_weekId_isHelper: {
          memberId,
          assignmentTypeId,
          weekId,
          isHelper: isHelper ?? false,
        },
      },
      update: { memberId },
      create: {
        memberId,
        assignmentTypeId,
        weekId,
        isHelper: isHelper ?? false,
      },
      include: {
        member: true,
        assignmentType: true,
      },
    });

    res.json(assignment);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Semana no encontrada' });
    res.status(500).json({ error: err.message });
  }
}

export async function deleteWeek(req, res) {
  try {
    // Eliminar asignaciones primero
    await prisma.assignmentDone.deleteMany({
      where: { weekId: Number(req.params.id) },
    });
    await prisma.week.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Semana no encontrada' });
    res.status(500).json({ error: err.message });
  }
}

export async function generateWeekAssignments(req, res) {
  try {
    const weekId = Number(req.params.id);
    const result = await generateAssignments(weekId);
    res.json({ ok: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}