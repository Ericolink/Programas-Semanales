import { prisma } from '../prismaClient.js';

export async function getGroups(req, res) {
  try {
    const groups = await prisma.group.findMany({
      include: { members: true },
      orderBy: { name: 'asc' },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getGroupById(req, res) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: Number(req.params.id) },
      include: { members: true },
    });
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createGroup(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    const group = await prisma.group.create({ data: { name } });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateGroup(req, res) {
  try {
    const { name } = req.body;
    const group = await prisma.group.update({
      where: { id: Number(req.params.id) },
      data: { name },
    });
    res.json(group);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Grupo no encontrado' });
    res.status(500).json({ error: err.message });
  }
}

export async function deleteGroup(req, res) {
  try {
    // Desasociar miembros antes de eliminar
    await prisma.member.updateMany({
      where: { groupId: Number(req.params.id) },
      data: { groupId: null },
    });

    await prisma.group.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Grupo no encontrado' });
    res.status(500).json({ error: err.message });
  }
}