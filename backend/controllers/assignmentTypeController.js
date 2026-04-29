import { prisma } from '../prismaClient.js';

export async function getAssignmentTypes(req, res) {
  try {
    const types = await prisma.assignmentType.findMany({
      where: { congregationId: req.user.congregationId },
      orderBy: [{ section: 'asc' }, { order: 'asc' }],
    });
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAssignmentTypeById(req, res) {
  try {
    const type = await prisma.assignmentType.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!type) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAssignmentType(req, res) {
  try {
    const { name, gender, section, order, requiresHelper } = req.body;
    const congregationId = req.user.congregationId;

    if (!name || !gender || !section)
      return res.status(400).json({ error: 'name, gender y section son requeridos' });
    if (!['H', 'M', 'AMBOS'].includes(gender))
      return res.status(400).json({ error: 'gender debe ser H, M o AMBOS' });

    const type = await prisma.assignmentType.create({
      data: { name, gender, section, order: order ?? 0, requiresHelper: requiresHelper ?? false, congregationId },
    });
    res.status(201).json(type);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe una asignación con ese nombre' });
    res.status(500).json({ error: err.message });
  }
}

export async function updateAssignmentType(req, res) {
  try {
    const { name, gender, section, order, requiresHelper } = req.body;
    if (gender && !['H', 'M', 'AMBOS'].includes(gender))
      return res.status(400).json({ error: 'gender debe ser H, M o AMBOS' });

    const type = await prisma.assignmentType.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!type) return res.status(404).json({ error: 'Asignación no encontrada' });

    const updated = await prisma.assignmentType.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(gender && { gender }),
        ...(section && { section }),
        ...(order !== undefined && { order }),
        ...(requiresHelper !== undefined && { requiresHelper }),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAssignmentType(req, res) {
  try {
    const type = await prisma.assignmentType.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!type) return res.status(404).json({ error: 'Asignación no encontrada' });

    await prisma.assignmentType.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2003') return res.status(409).json({ error: 'No se puede eliminar, tiene asignaciones registradas' });
    res.status(500).json({ error: err.message });
  }
}