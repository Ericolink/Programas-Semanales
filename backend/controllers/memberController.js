import { prisma } from '../prismaClient.js';

const INCLUDE = {
  group: true,
  role: true,
};

export async function createMember(req, res) {
  try {
    const { name, gender, roleId, groupId, active } = req.body;

    if (!name || !gender)
      return res.status(400).json({ error: 'name y gender son requeridos' });

    if (!['H', 'M'].includes(gender))
      return res.status(400).json({ error: 'gender debe ser H o M' });

    const member = await prisma.member.create({
      data: {
        name,
        gender,
        roleId: roleId ?? null,
        groupId: groupId ?? null,
        active: active ?? true,
      },
      include: INCLUDE,
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMembers(req, res) {
  try {
    const members = await prisma.member.findMany({
      include: INCLUDE,
      orderBy: { name: 'asc' },
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMemberById(req, res) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: Number(req.params.id) },
      include: INCLUDE,
    });
    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateMember(req, res) {
  try {
    const { name, gender, roleId, groupId, active } = req.body;

    if (gender && !['H', 'M'].includes(gender))
      return res.status(400).json({ error: 'gender debe ser H o M' });

    const member = await prisma.member.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(gender !== undefined && { gender }),
        ...(roleId !== undefined && { roleId }),
        ...(groupId !== undefined && { groupId }),
        ...(active !== undefined && { active }),
      },
      include: INCLUDE,
    });
    res.json(member);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Miembro no encontrado' });
    res.status(500).json({ error: err.message });
  }
}

export async function deleteMember(req, res) {
  try {
    await prisma.member.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Miembro no encontrado' });
    if (err.code === 'P2003') return res.status(409).json({ error: 'No se puede eliminar, tiene asignaciones registradas' });
    res.status(500).json({ error: err.message });
  }
}