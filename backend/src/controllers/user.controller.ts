import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const { search } = req.query;

    // ดึงรายชื่อ User ทั้งหมดยกเว้นตัวเอง (สำหรับเอาไปแท็ก)
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        ...(search
          ? {
              OR: [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error });
  }
};