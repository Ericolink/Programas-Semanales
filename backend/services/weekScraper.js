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
  let partNumber = 0; // contador global de puntos del programa

  const titulo = $('h1').first().text().trim();
  const startDate = parseDateFromTitle(titulo);

  // Apertura — siempre fijas, sin número
  partes.push({ name: 'Canción y oración de apertura', customName: null, section: 'Apertura', gender: 'H', order: order++, requiresHelper: false });
  partes.push({ name: 'Palabras de introducción',      customName: null, section: 'Apertura', gender: 'H', order: order++, requiresHelper: false });

  let currentSection = '';

  $('h2, h3').each((_, el) => {
    const tag = el.tagName;
    const text = $(el).text().trim();

    if (tag === 'h2') {
      if (/tesoros de la biblia/i.test(text))        currentSection = 'Tesoros de la Biblia';
      else if (/seamos mejores maestros/i.test(text)) currentSection = 'Seamos Mejores Maestros';
      else if (/nuestra vida cristiana/i.test(text))  currentSection = 'Nuestra Vida Cristiana';
      return;
    }

    if (tag === 'h3') {
      if (/^canción/i.test(text) || /palabras de introducción/i.test(text)) return;

      if (/palabras de conclusión/i.test(text)) {
        partes.push({ name: 'Palabras de conclusión', customName: null, section: 'Cierre', gender: 'H', order: 99, requiresHelper: false });
        partes.push({ name: 'Oración de cierre',      customName: null, section: 'Cierre', gender: 'H', order: 100, requiresHelper: false });
        return;
      }

      if (/estudio bíblico de la congregación/i.test(text)) {
        partes.push({ name: 'Estudio bíblico de la congregación', customName: null, section: 'Nuestra Vida Cristiana', gender: 'H', order: 98, requiresHelper: false });
        return;
      }

      const cleanName = text.replace(/^\d+\.\s*/, '').trim();
      partNumber++;

      if (currentSection === 'Tesoros de la Biblia') {
        const isBibleReading = /lectura de la biblia/i.test(cleanName);
        const isPerlas       = /busquemos perlas escondidas/i.test(cleanName);
        const isFirstDiscurso = !isBibleReading && !isPerlas;

        partes.push({
          name:       isFirstDiscurso ? `Discurso de Tesoros de la Biblia` : cleanName,
          customName: isFirstDiscurso ? cleanName : null,
          section:    currentSection,
          gender:     isBibleReading ? 'AMBOS' : 'H',
          order:      order++,
          requiresHelper: false,
        });
      }

      if (currentSection === 'Seamos Mejores Maestros') {
        const key = Object.keys(SMM_TYPES).find(k => cleanName.toLowerCase().startsWith(k));
        const meta = SMM_TYPES[key] ?? { requiresHelper: false };

        // Nombre único usando el número de punto: "Empiece conversaciones 4"
        partes.push({
          name:           `${cleanName} ${partNumber}`,
          customName:     null,
          section:        currentSection,
          gender:         'AMBOS',
          order:          order++,
          requiresHelper: meta.requiresHelper,
        });
      }

      if (currentSection === 'Nuestra Vida Cristiana') {
        // Nombre único usando el número de punto: "Parte de Nuestra Vida Cristiana 7"
        partes.push({
          name:       `Parte de Nuestra Vida Cristiana ${partNumber}`,
          customName: cleanName,
          section:    currentSection,
          gender:     'H',
          order:      order++,
          requiresHelper: false,
        });
      }
    }
  });

  return { startDate, docId, partes };
}

function parseDateFromTitle(titulo) {
  const months = {
    ENERO: 0, FEBRERO: 1, MARZO: 2, ABRIL: 3, MAYO: 4, JUNIO: 5,
    JULIO: 6, AGOSTO: 7, SEPTIEMBRE: 8, OCTUBRE: 9, NOVIEMBRE: 10, DICIEMBRE: 11,
  };

  // Limpia caracteres invisibles y normaliza
  const clean = titulo.replace(/[\u00A0\u200B\s]+/g, ' ').trim();
  console.log('Título recibido:', JSON.stringify(clean));

  const match = clean.match(/(\d{1,2})\s*[-–]\s*\d{1,2}\s+DE\s+([A-ZÁÉÍÓÚ]+)/i);
  console.log('Match:', match);

  if (!match) return null;

  const day = parseInt(match[1]);
  const month = months[match[2].toUpperCase()];
  if (month === undefined) return null;

  return new Date(2026, month, day);
}