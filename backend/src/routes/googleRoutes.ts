import express from 'express';
import { googleAuth, googleCallback, createCalendarEvent, listCalendarEvents, createMultipleCalendarEvents } from '../controllers/googleController';

const router = express.Router();


// Google OAuth2
router.get('/auth', googleAuth);
router.get('/callback', googleCallback);

// Google Calendar
router.post('/event', createCalendarEvent);
router.post('/events/bulk', createMultipleCalendarEvents);
router.get('/events', listCalendarEvents);

export default router;
