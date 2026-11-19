import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';
import { TaskStatus } from '@prisma/client';

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // ดึงงานที่ตนเองเป็นเจ้าของ หรือมีส่วนเกี่ยวข้อง
    const userTaskFilter = {
      OR: [
        { creatorId: userId },
        { collaborators: { some: { userId } } },
      ],
    };

    // 1. นับจำนวนรวมตามสถานะ
    const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
      prisma.task.count({ where: userTaskFilter }),
      prisma.task.count({ where: { ...userTaskFilter, status: TaskStatus.DONE } }),
      prisma.task.count({ where: { ...userTaskFilter, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { ...userTaskFilter, status: TaskStatus.TODO } }),
    ]);

    // 2. งานที่เลยกำหนดส่ง (Overdue: กำหนดส่ง < ปัจจุบัน และสถานะยังไม่ DONE)
    const overdueTasks = await prisma.task.count({
      where: {
        ...userTaskFilter,
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE },
      },
    });

    // 3. งานแยกตามหมวดหมู่ (นับจากงานทั้งหมดที่ User มีสิทธิ์เข้าถึง ทั้งงานที่สร้างเองและงานที่ถูกแท็ก)
    const [userCategories, allUserTasks] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.task.findMany({
        where: userTaskFilter,
        include: { category: true },
      }),
    ]);

    const tasksByCategory = userCategories.map((c) => {
      const count = allUserTasks.filter(
        (t) => t.category && t.category.name.toLowerCase() === c.name.toLowerCase()
      ).length;
      return {
        name: c.name,
        count,
        color: c.color,
      };
    });

    // 4. งาน 5 ชิ้นที่ใกล้ถึงกำหนดส่งมากที่สุด (Upcoming Deadlines)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        ...userTaskFilter,
        dueDate: { gte: now },
        status: { not: TaskStatus.DONE },
      },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    return res.json({
      summary: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
      },
      tasksByCategory,
      upcomingDeadlines: upcomingTasks,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};