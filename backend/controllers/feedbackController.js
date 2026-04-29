import nodemailer from 'nodemailer';
import { prisma } from '../prismaClient.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendFeedback(req, res) {
  try {
    const { type, message } = req.body;
    if (!type || !message)
      return res.status(400).json({ error: 'Tipo y mensaje son requeridos' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { congregation: true },
    });

    // Guardar en BD
    await prisma.feedback.create({
      data: { userId: req.user.id, type, message },
    });

    // Enviar email
    await transporter.sendMail({
      from: `"Programas Semanales" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `[${type.toUpperCase()}] Feedback de ${user.congregation?.name ?? 'desconocido'}`,
      html: `
        <h3>Nuevo reporte de feedback</h3>
        <p><strong>Congregación:</strong> ${user.congregation?.name ?? 'N/A'}</p>
        <p><strong>Usuario:</strong> ${user.name} (${user.email})</p>
        <p><strong>Tipo:</strong> ${type}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getFeedback(req, res) {
  try {
    const feedback = await prisma.feedback.findMany({
      include: { user: { include: { congregation: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}