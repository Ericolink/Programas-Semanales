import { scrapeWeek } from '../services/weekScraper.js';
import { prisma } from '../prismaClient.js';

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