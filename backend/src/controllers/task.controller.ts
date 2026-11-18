import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';
import { TaskStatus, Priority } from '@prisma/client';

// 1. ดึงรายการงานทั้งหมด (รองรับ Search, Filter และแยกงานตัวเอง/งานที่ถูกแท็ก)
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, status, categoryId, priority, filterType } = req.query;

    // เงื่อนไขค้นหาข้อความ
    const searchCondition = search
      ? {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' as const } },
            { description: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }
      : {};

    // เงื่อนไขเจ้าของงาน หรือ ผู้ที่ถูกแท็ก
    let ownershipCondition: any = {
      OR: [
        { creatorId: userId },
        { collaborators: { some: { userId } } },
      ],
    };

    if (filterType === 'created_by_me') {
      ownershipCondition = { creatorId: userId };
    } else if (filterType === 'tagged_to_me') {
      ownershipCondition = { collaborators: { some: { userId } } };
    }

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          ownershipCondition,
          status ? { status: status as TaskStatus } : {},
          categoryId ? { categoryId: String(categoryId) } : {},
          priority ? { priority: priority as Priority } : {},
          searchCondition,
        ],
      },
      include: {
        category: true,
        creator: { select: { id: true, name: true, email: true } },
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// 2. สร้างงานใหม่ (พร้อมแท็กเพื่อนได้หลายคน)
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, status, priority, dueDate, categoryId, collaboratorIds } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
        creatorId: userId,
        // แท็กเพื่อนร่วมงานลงตารางเชื่อม
        collaborators: collaboratorIds && Array.isArray(collaboratorIds)
          ? {
              create: collaboratorIds.map((collabUserId: string) => ({
                userId: collabUserId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating task', error });
  }
};

// 3. อัปเดตงาน (แก้ไขข้อมูล หรือเปลี่ยนสถานะ TODO / IN_PROGRESS / DONE)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { title, description, status, priority, dueDate, categoryId, collaboratorIds } = req.body;

    // ตรวจสอบว่างานนี้มีอยู่จริง และผู้ใช้มีสิทธิ์เข้าถึง (เป็นคนสร้าง หรือถูกแท็ก)
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { collaborators: true },
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isCreator = existingTask.creatorId === userId;
    const isCollaborator = existingTask.collaborators.some((c) => c.userId === userId);

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this task' });
    }

    // ถ้ามีการแก้ไขรายชื่อผู้ถูกแท็ก (เฉพาะผู้สร้างงานเท่านั้นที่มีสิทธิ์เปลี่ยนคนแท็ก)
    if (collaboratorIds && Array.isArray(collaboratorIds) && isCreator) {
      await prisma.taskCollaborator.deleteMany({ where: { taskId: id } });
      await prisma.taskCollaborator.createMany({
        data: collaboratorIds.map((cId: string) => ({
          taskId: id,
          userId: cId,
        })),
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status: status as TaskStatus }),
        ...(priority && { priority: priority as Priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: {
        category: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating task', error });
  }
};

// 4. ลบงาน (เฉพาะเจ้าของงาน/ผู้สร้างเท่านั้น)
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.creatorId !== userId) {
      return res.status(403).json({ message: 'Forbidden: Only the creator can delete this task' });
    }

    await prisma.task.delete({ where: { id } });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting task', error });
  }
};