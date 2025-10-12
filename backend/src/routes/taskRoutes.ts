import { Router } from 'express';
import { createTaskPlan } from '../controllers/taskController';

const router = Router();

// POST /api/tasks
router.post('/tasks', createTaskPlan);

export default router;
