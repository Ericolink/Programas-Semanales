import { scrapeWeek } from '../services/weekScraper.js';
import { generateAssignments } from '../services/assignmentGenerator.js';
import { prisma } from '../prismaClient.js';

export async function importWeek(req, res) {
  try {
    const { docId } = req.body;
    const congregationId = req.user.congregationId;
    if (!docId) return res.status(400).json({ error: 'docId es requerido' });

    const { startDate, partes } = await scrapeWeek(docId);
    if (!startDate) return res.status(400).json({ error: 'No se pudo detectar la fecha.' });

    const week = await prisma.week.upsert({
      where: { startDate_congregationId: { startDate, congregationId } },
      update: {},
      create: { startDate, congregationId },
    });

    for (const parte of partes) {
      const baseType = await prisma.assignmentType.upsert({
        where: { name_congregationId: { name: parte.name, congregationId } },
        update: {},
        create: { name: parte.name, section: parte.section, gender: parte.gender, order: parte.order, requiresHelper: parte.requiresHelper, congregationId },
      });

      await prisma.weekAssignmentType.upsert({
        where: { weekId_assignmentTypeId: { weekId: week.id, assignmentTypeId: baseType.id } },
        update: { customName: parte.customName ?? null },
        create: { weekId: week.id, assignmentTypeId: baseType.id, customName: parte.customName ?? null },
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
      where: { congregationId: req.user.congregationId },
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { assignments: true } } },
    });
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWeekById(req, res) {
  try {
    const week = await prisma.week.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
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
    if (!week) return res.status(404).json({ error: 'Semana no encontrada' });
    res.json(week);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateWeekAssignments(req, res) {
  try {
    const weekId = Number(req.params.id);
    const week = await prisma.week.findFirst({
      where: { id: weekId, congregationId: req.user.congregationId },
    });
    if (!week) return res.status(404).json({ error: 'Semana no encontrada' });
    const result = await generateAssignments(weekId, req.user.congregationId);
    res.json({ ok: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateAssignmentMember(req, res) {
  try {
    const { assignmentId } = req.params;
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId es requerido' });

    const assignment = await prisma.assignmentDone.update({
      where: { id: Number(assignmentId) },
      data: { memberId: Number(memberId) },
      include: { member: true, assignmentType: true },
    });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAssignmentType(req, res) {
  try {
    const { assignmentId } = req.params;
    const { assignmentTypeId, customName } = req.body;
    if (!assignmentTypeId) return res.status(400).json({ error: 'assignmentTypeId es requerido' });

    const assignment = await prisma.assignmentDone.update({
      where: { id: Number(assignmentId) },
      data: { assignmentTypeId: Number(assignmentTypeId), customName: customName ?? null },
      include: { member: true, assignmentType: true },
    });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteWeek(req, res) {
  try {
    const week = await prisma.week.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!week) return res.status(404).json({ error: 'Semana no encontrada' });

    await prisma.assignmentDone.deleteMany({ where: { weekId: Number(req.params.id) } });
    await prisma.weekAssignmentType.deleteMany({ where: { weekId: Number(req.params.id) } });
    await prisma.week.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}