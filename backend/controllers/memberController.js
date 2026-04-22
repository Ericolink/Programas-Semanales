const prisma = require("../prismaClient");

// Crear miembro
const createMember = async (req, res) => {
  try {
    const { name, gender, role, groupId } = req.body;

    const newMember = await prisma.member.create({
      data: {
        name,
        gender,
        role,
        groupId: groupId || null,
      },
    });

    res.json(newMember);
  } catch (error) {
    res.status(500).json({ error: "Error al crear miembro" });
  }
};

// Obtener todos
const getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        group: true,
      },
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener miembros" });
  }
};

// Obtener uno
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id: Number(id) },
    });

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener miembro" });
  }
};

// Actualizar
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, role, groupId } = req.body;

    const updated = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        name,
        gender,
        role,
        groupId,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar miembro" });
  }
};

// Eliminar
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.member.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Miembro eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar miembro" });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};