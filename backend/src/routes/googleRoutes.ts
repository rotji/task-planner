import express from 'express';
import { googleAuth, googleCallback, createCalendarEvent, listCalendarEvents, createMultipleCalendarEvents, googleConfigDebug } from '../controllers/googleController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();


// Google OAuth2
router.get('/auth', googleAuth);
router.get('/callback', googleCallback);
router.get('/config', googleConfigDebug);

// Google Calendar (protected)
router.post('/event', requireAuth, createCalendarEvent);
router.post('/events/bulk', requireAuth, createMultipleCalendarEvents);
router.get('/events', requireAuth, listCalendarEvents);

export default router;
