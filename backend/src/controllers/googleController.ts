// Create multiple calendar events from an array of tasks
export const createMultipleCalendarEvents = async (req: Request, res: Response) => {
  console.log('createMultipleCalendarEvents called. Request body:', req.body);
  if (!oauthTokens) {
    console.error('Google Calendar: Not authenticated with Google.');
    return res.status(401).send('Not authenticated with Google');
  }
  oauth2Client.setCredentials(oauthTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const { tasks } = req.body; // tasks: Array<{ summary: string, description?: string, start?: string, end?: string }>
  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.error('Google Calendar: No tasks provided in request body.', req.body);
    return res.status(400).send('No tasks provided');
  }
  const results = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const now = new Date();
    // Default: schedule each task 1 hour after the previous
    const start = task.start || new Date(now.getTime() + i * 3600000).toISOString();
    const end = task.end || new Date(new Date(start).getTime() + 1800000).toISOString(); // 30 min duration
    const event = {
      summary: task.summary || `Task ${i + 1}`,
      description: task.description || '',
      start: { dateTime: start, timeZone: 'UTC' },
      end: { dateTime: end, timeZone: 'UTC' },
    };
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      results.push({ success: true, event: response.data });
    } catch (err) {
      console.error(`Google Calendar: Failed to create event for task ${i + 1}:`, {
        event,
        error: err,
      });
      results.push({ success: false, error: err instanceof Error ? err.message : err });
    }
  }
  res.json(results);
};
import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Store tokens in memory for demo purposes
let oauthTokens: any = null;

export const googleAuth = (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('No code provided');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauthTokens = tokens;
    oauth2Client.setCredentials(tokens);
    // Determine redirect URL based on environment
    let frontendRedirect = 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production') {
      frontendRedirect = 'https://ai-tasks.netlify.app/';
    }
    if (process.env.FRONTEND_REDIRECT_URI) {
      frontendRedirect = process.env.FRONTEND_REDIRECT_URI;
    }
    res.redirect(frontendRedirect);
  } catch (err) {
    res.status(500).send('Error exchanging code for tokens');
  }
};

// Create a calendar event (demo)
export const createCalendarEvent = async (req: Request, res: Response) => {
  if (!oauthTokens) return res.status(401).send('Not authenticated with Google');
  oauth2Client.setCredentials(oauthTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = {
    summary: req.body.summary || 'Sample Event',
    description: req.body.description || 'Created from AI Task Planner',
    start: {
      dateTime: req.body.start || new Date(Date.now() + 3600000).toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: req.body.end || new Date(Date.now() + 7200000).toISOString(),
      timeZone: 'UTC',
    },
  };
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    res.json(response.data);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).send('Failed to create event');
  }
};

// List calendar events (demo)
export const listCalendarEvents = async (req: Request, res: Response) => {
  if (!oauthTokens) return res.status(401).send('Not authenticated with Google');
  oauth2Client.setCredentials(oauthTokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString(),
    });
    res.json(response.data.items);
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).send('Failed to list events');
  }
};
