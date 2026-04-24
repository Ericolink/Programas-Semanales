import * as cheerio from 'cheerio';

const BASE_URL = 'https://wol.jw.org/es/wol/d/r4/lp-s';

const SMM_TYPES = {
  'empiece conversaciones': { name: 'Empiece conversaciones', requiresHelper: true },
  'haga revisitas':         { name: 'Haga revisitas',         requiresHelper: true },
  'explique sus creencias': { name: 'Explique sus creencias', requiresHelper: true },
  'haga discípulos':        { name: 'Haga discípulos',        requiresHelper: true },
  'discurso':               { name: 'Discurso',               requiresHelper: false },
};

export async function scrapeWeek(docId) {
  const url = `${BASE_URL}/${docId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo obtener la página: ${res.status}`);
  const html = await res.text();
  return parseWeekHTML(html, docId);
}

function parseWeekHTML(html, docId) {
  const $ = cheerio.load(html);
  const partes = [];
  let order = 0;

  // Fecha — está en el h1
  const titulo = $('h1').first().text().trim(); // "20-26 DE ABRIL"
  const startDate = parseDateFromTitle(titulo);

  // Canción apertura y oración — está en el primer h3
  partes.push({
    name: 'Canción y oración de apertura',
    section: 'Apertura',
    gender: 'H',
    order: order++,
    requiresHelper: false,
  });
  partes.push({
    name: 'Palabras de introducción',
    section: 'Apertura',
    gender: 'H',
    order: order++,
    requiresHelper: false,
  });

  let currentSection = '';

  $('h2, h3').each((_, el) => {
    const tag = el.tagName;
    const text = $(el).text().trim();

    // Detectar sección principal
    if (tag === 'h2') {
      if (/tesoros de la biblia/i.test(text))       currentSection = 'Tesoros de la Biblia';
      else if (/seamos mejores maestros/i.test(text)) currentSection = 'Seamos Mejores Maestros';
      else if (/nuestra vida cristiana/i.test(text))  currentSection = 'Nuestra Vida Cristiana';
      return;
    }

    // h3 = partes individuales
    if (tag === 'h3') {
      // Ignorar canciones y palabras de apertura/conclusión (ya las agregamos fijas)
      if (/^canción/i.test(text) || /palabras de introducción/i.test(text)) return;

      // Palabras de conclusión — parte fija de cierre
      if (/palabras de conclusión/i.test(text)) {
        partes.push({ name: 'Palabras de conclusión', section: 'Cierre', gender: 'H', order: 99, requiresHelper: false });
        partes.push({ name: 'Oración de cierre', section: 'Cierre', gender: 'H', order: 100, requiresHelper: false });
        return;
      }

      // Estudio bíblico
      if (/estudio bíblico de la congregación/i.test(text)) {
        partes.push({ name: 'Estudio bíblico de la congregación', section: 'Nuestra Vida Cristiana', gender: 'H', order: 98, requiresHelper: false });
        return;
      }

      // Quitar número inicial: "4. Empiece conversaciones" → "Empiece conversaciones"
      const cleanName = text.replace(/^\d+\.\s*/, '').trim();

      if (currentSection === 'Tesoros de la Biblia') {
        const isBibleReading = /lectura de la biblia/i.test(cleanName);
        partes.push({
          name: cleanName,
          section: currentSection,
          gender: isBibleReading ? 'AMBOS' : 'H',
          order: order++,
          requiresHelper: false,
        });
      }

      if (currentSection === 'Seamos Mejores Maestros') {
        const key = Object.keys(SMM_TYPES).find(k => cleanName.toLowerCase().startsWith(k));
        const meta = SMM_TYPES[key] ?? { name: cleanName, requiresHelper: false };
        partes.push({
          name: meta.name,
          section: currentSection,
          gender: 'AMBOS',
          order: order++,
          requiresHelper: meta.requiresHelper,
        });
      }

      if (currentSection === 'Nuestra Vida Cristiana') {
        partes.push({
          name: cleanName,
          section: currentSection,
          gender: 'H',
          order: order++,
          requiresHelper: false,
        });
      }
    }
  });

  return { startDate, docId, partes: partes.sort((a, b) => a.order - b.order) };
}

function parseDateFromTitle(titulo) {
  // "20-26 DE ABRIL" → Date
  const months = {
    ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
    JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11,
  };
  const match = titulo.match(/(\d{1,2})[-–]\d{1,2}\s+DE\s+([A-ZÁÉÍÓÚ]+)/i);
  if (!match) return null;
  const day = parseInt(match[1]);
  const month = months[match[2].toUpperCase()];
  return new Date(2026, month, day);
}