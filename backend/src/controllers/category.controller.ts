import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching categories', error });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  return res.status(403).json({ 
    message: 'Forbidden: ไม่อนุญาตให้สร้างหมวดหมู่ใหม่เอง ผู้ใช้ต้องเลือกใช้หมวดหมู่ระบบที่กำหนดไว้เท่านั้น' 
  });
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category || category.userId !== userId) {
      return res.status(404).json({ message: 'Category not found or unauthorized' });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting category', error });
  }
};