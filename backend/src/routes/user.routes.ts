import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getUsers);

export default router;