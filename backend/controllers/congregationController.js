import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient.js';

export async function getCongregations(req, res) {
  try {
    const congregations = await prisma.congregation.findMany({
      include: { _count: { select: { members: true, users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(congregations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCongregation(req, res) {
  try {
    const { congregationName, adminName, adminEmail, adminPassword } = req.body;

    if (!congregationName || !adminName || !adminEmail || !adminPassword)
      return res.status(400).json({ error: 'Todos los campos son requeridos' });

    // Crear congregación y usuario admin en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const congregation = await tx.congregation.create({
        data: { name: congregationName },
      });

      const hashed = await bcrypt.hash(adminPassword, 10);
      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashed,
          role: 'ADMIN',
          congregationId: congregation.id,
        },
      });

      return { congregation, user };
    });

    res.status(201).json({
      congregation: result.congregation,
      user: { id: result.user.id, email: result.user.email, name: result.user.name },
    });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: err.message });
  }
}

export async function toggleCongregation(req, res) {
  try {
    const congregation = await prisma.congregation.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!congregation) return res.status(404).json({ error: 'No encontrada' });

    const updated = await prisma.congregation.update({
      where: { id: Number(req.params.id) },
      data: { active: !congregation.active },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}