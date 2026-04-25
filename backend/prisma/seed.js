import { prisma } from '../prismaClient.js';

async function main() {
  // 1. Roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'Anciano' },      update: {}, create: { name: 'Anciano',      canLead: true  } }),
    prisma.role.upsert({ where: { name: 'Ministerial' },  update: {}, create: { name: 'Ministerial',  canLead: true  } }),
    prisma.role.upsert({ where: { name: 'Publicador' },   update: {}, create: { name: 'Publicador',   canLead: false } }),
    prisma.role.upsert({ where: { name: 'Pionero' },      update: {}, create: { name: 'Pionero',      canLead: false } }),
  ]);

  const [anciano, ministerial, publicador, pionero] = roles;
  console.log('✅ Roles creados');

  // 2. Grupos
  const grupos = await Promise.all([
    prisma.group.upsert({ where: { id: 1 }, update: {}, create: { name: 'Grupo 1' } }),
    prisma.group.upsert({ where: { id: 2 }, update: {}, create: { name: 'Grupo 2' } }),
    prisma.group.upsert({ where: { id: 3 }, update: {}, create: { name: 'Grupo 3' } }),
  ]);

  const [grupo1, grupo2, grupo3] = grupos;
  console.log('✅ Grupos creados');

  // 3. Miembros
  const miembros = [
    // Ancianos (H)
    { name: 'Carlos Mendoza',    gender: 'H', roleId: anciano.id,      groupId: grupo1.id },
    { name: 'Roberto Herrera',   gender: 'H', roleId: anciano.id,      groupId: grupo1.id },
    { name: 'Miguel Ángel Ruiz', gender: 'H', roleId: anciano.id,      groupId: grupo2.id },
    // Ministeriales (H)
    { name: 'José Ramírez',      gender: 'H', roleId: ministerial.id,  groupId: grupo1.id },
    { name: 'Luis Torres',       gender: 'H', roleId: ministerial.id,  groupId: grupo2.id },
    { name: 'Fernando Castillo', gender: 'H', roleId: ministerial.id,  groupId: grupo2.id },
    { name: 'Andrés Morales',    gender: 'H', roleId: ministerial.id,  groupId: grupo3.id },
    // Publicadores (H)
    { name: 'Diego Flores',      gender: 'H', roleId: publicador.id,   groupId: grupo1.id },
    { name: 'Héctor Jiménez',    gender: 'H', roleId: publicador.id,   groupId: grupo2.id },
    { name: 'Eduardo Vargas',    gender: 'H', roleId: publicador.id,   groupId: grupo3.id },
    { name: 'Ricardo Guzmán',    gender: 'H', roleId: publicador.id,   groupId: grupo3.id },
    // Pioneros (H)
    { name: 'Pablo Reyes',       gender: 'H', roleId: pionero.id,      groupId: grupo1.id },
    { name: 'Marcos Ortega',     gender: 'H', roleId: pionero.id,      groupId: grupo3.id },
    // Publicadoras (M)
    { name: 'María González',    gender: 'M', roleId: publicador.id,   groupId: grupo1.id },
    { name: 'Ana Martínez',      gender: 'M', roleId: publicador.id,   groupId: grupo1.id },
    { name: 'Laura Sánchez',     gender: 'M', roleId: publicador.id,   groupId: grupo2.id },
    { name: 'Isabel Pérez',      gender: 'M', roleId: publicador.id,   groupId: grupo2.id },
    { name: 'Carmen López',      gender: 'M', roleId: publicador.id,   groupId: grupo3.id },
    { name: 'Patricia Díaz',     gender: 'M', roleId: publicador.id,   groupId: grupo3.id },
    // Pioneras (M)
    { name: 'Rosa Fernández',    gender: 'M', roleId: pionero.id,      groupId: grupo1.id },
    { name: 'Sofía Ramírez',     gender: 'M', roleId: pionero.id,      groupId: grupo2.id },
    { name: 'Lucía Herrera',     gender: 'M', roleId: pionero.id,      groupId: grupo3.id },
  ];

  for (const m of miembros) {
    await prisma.member.upsert({
      where: { id: miembros.indexOf(m) + 1 },
      update: {},
      create: { ...m, active: true },
    });
  }

  console.log(`✅ ${miembros.length} miembros creados`);
  console.log('🎉 Seed completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());