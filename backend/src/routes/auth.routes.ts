import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/db';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// ดึงข้อมูลตัวเองเมื่อเปิดเว็บใหม่ (ใช้เช็ค session หน้าบ้าน)
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, email: true, name: true },
  });
  return res.json({ user });
});

export default router;