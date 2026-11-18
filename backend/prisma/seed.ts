import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. ล้างข้อมูลเก่าก่อน
  await prisma.taskCollaborator.deleteMany();
  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. สร้าง User ตัวอย่าง 2 คน (เอาไว้เทสแท็กข้ามกัน)
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: passwordHash,
      categories: {
        create: [
          { name: 'Work', color: '#3B82F6' },
          { name: 'Personal', color: '#10B981' },
          { name: 'Urgent', color: '#EF4444' },
        ],
      },
    },
    include: { categories: true },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: passwordHash,
      categories: {
        create: [
          { name: 'Design', color: '#8B5CF6' },
          { name: 'Marketing', color: '#F59E0B' },
        ],
      },
    },
    include: { categories: true },
  });

  console.log('✅ Users created: alex@example.com and sarah@example.com (Password: password123)');

  const alexWorkCat = alex.categories.find((c) => c.name === 'Work')!;
  const alexPersonalCat = alex.categories.find((c) => c.name === 'Personal')!;
  const alexUrgentCat = alex.categories.find((c) => c.name === 'Urgent')!;

  // 3. สร้าง Task ตัวอย่างให้ Alex
  // งานที่ 1: กำลังทำ + ใกล้ส่ง + แท็ก Sarah
  await prisma.task.create({
    data: {
      title: 'Design Dashboard UI for Client',
      description: 'Create responsive charts and KPI metrics view.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // อีก 2 วันข้างหน้า
      categoryId: alexWorkCat.id,
      creatorId: alex.id,
      collaborators: {
        create: [{ userId: sarah.id }], // แท็ก Sarah
      },
    },
  });

  // งานที่ 2: งานที่เลยกำหนดส่งแล้ว (Overdue Task สำหรับโชว์ Dashboard Alert)
  await prisma.task.create({
    data: {
      title: 'Submit Monthly Financial Report',
      description: 'Summary of team expenses and receipts.',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // ผ่านมาแล้ว 3 วัน (Overdue!)
      categoryId: alexUrgentCat.id,
      creatorId: alex.id,
    },
  });

  // งานที่ 3: งานที่ทำเสร็จแล้ว (DONE)
  await prisma.task.create({
    data: {
      title: 'Setup PostgreSQL Database and Express Backend',
      description: 'Configured Prisma models, migrations, and JWT auth.',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      categoryId: alexWorkCat.id,
      creatorId: alex.id,
    },
  });

  // งานที่ 4: งานส่วนตัว
  await prisma.task.create({
    data: {
      title: 'Buy Groceries & Coffee Beans',
      description: 'Milk, oats, espresso roast.',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      categoryId: alexPersonalCat.id,
      creatorId: alex.id,
    },
  });

  console.log('✅ Seed finished successfully! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });