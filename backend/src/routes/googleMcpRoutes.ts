import express from 'express';
import { metadata, query, act, docs } from '../mcp/googleCalendarMcp';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

router.get('/metadata', metadata);
router.get('/docs', docs);
// Allow query and act for authenticated users. Agents that run server-side can pass userId in body.
router.post('/query', requireAuth, query);
router.post('/act', requireAuth, act);

export default router;
