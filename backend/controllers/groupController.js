import { prisma } from '../prismaClient.js';

export async function getGroups(req, res) {
  try {
    const groups = await prisma.group.findMany({
      where: { congregationId: req.user.congregationId },
      include: {
        members: { include: { role: true }, orderBy: { name: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getGroupById(req, res) {
  try {
    const group = await prisma.group.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
      include: {
        members: { include: { role: true }, orderBy: { name: 'asc' } },
      },
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
    const group = await prisma.group.create({
      data: { name, congregationId: req.user.congregationId },
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateGroup(req, res) {
  try {
    const { name } = req.body;
    const group = await prisma.group.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const updated = await prisma.group.update({
      where: { id: Number(req.params.id) },
      data: { name },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteGroup(req, res) {
  try {
    const group = await prisma.group.findFirst({
      where: { id: Number(req.params.id), congregationId: req.user.congregationId },
    });
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    await prisma.member.updateMany({
      where: { groupId: Number(req.params.id) },
      data: { groupId: null },
    });
    await prisma.group.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}