import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { congregation: true },
    });

    // Validaciones separadas (más claras para el usuario)
    if (!user)
      return res.status(401).json({ error: 'No existe una cuenta con ese correo' });

    if (!user.active)
      return res.status(401).json({ error: 'Esta cuenta está desactivada' });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        congregationId: user.congregationId,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        congregation: user.congregation,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { congregation: true },
      omit: { password: true },
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}