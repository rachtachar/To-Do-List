import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ทุก Route ของ Task ต้องผ่านการ Login (authenticate)
router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;