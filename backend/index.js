const express = require("express");
const cors = require("cors");

const app = express();
const prisma = require("./prismaClient");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});


app.get("/members", async (req, res) => {
  const members = await prisma.member.findMany();
  res.json(members);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});