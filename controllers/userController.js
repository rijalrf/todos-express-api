import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id), // Pastikan id adalah integer
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
};
