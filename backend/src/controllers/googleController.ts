import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/requireAuth';

dotenv.config();

// Resolve redirect URI depending on environment (prefer production redirect when in production)
const resolvedRedirectUri = process.env.NODE_ENV === 'production'
  ? process.env.GOOGLE_REDIRECT_URI_PROD || process.env.GOOGLE_REDIRECT_URI
  : process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  resolvedRedirectUri
);

// Startup diagnostic (safe: do not print secrets)
console.log('Google OAuth config:', {
  clientId: process.env.GOOGLE_CLIENT_ID ? 'present' : 'MISSING',
  redirectUri: resolvedRedirectUri ? resolvedRedirectUri : 'MISSING',
});

// Store tokens in memory for demo purposes (some legacy endpoints still use this)
let oauthTokens: any = null;

// Helper: get OAuth2 client for a user, refresh tokens if expired, and persist updates
export async function getOAuthClientForUser(user: any) {
  if (!user) throw new Error('No user provided');
  if (!user.googleTokens) throw new Error('No Google tokens stored for user');

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    resolvedRedirectUri
  );

  // Attach existing tokens
  client.setCredentials(user.googleTokens);

  const now = Date.now();
  const expiry = user.googleTokens?.expiry_date;

  // If token is expired or about to expire within 60s, refresh
  if (expiry && now >= (expiry - 60000)) {
    if (!user.googleTokens.refresh_token) {
      throw new Error('No refresh token available; user must re-authenticate.');
    }
    try {
      // refreshToken is protected in the types; cast to any to call it and normalize the return
      const r = await (client as any).refreshToken(user.googleTokens.refresh_token);
      const newTokens = r.tokens || r.credentials || {};
      // Merge tokens; keep existing refresh_token if provider didn't return a new one
      user.googleTokens = {
        ...user.googleTokens,
        ...newTokens,
        refresh_token: newTokens.refresh_token || user.googleTokens.refresh_token,
      };
      await user.save();
      client.setCredentials(user.googleTokens);
      console.log('Refreshed Google tokens for user', user._id);
    } catch (err) {
      console.error('Failed to refresh Google tokens for user', user._id, err);
      throw err;
    }
  }

  return client;
}

// Create multiple calendar events from an array of tasks
export const createMultipleCalendarEvents = async (req: AuthRequest, res: Response) => {
  console.log('createMultipleCalendarEvents called. Request body:', req.body);
  try {
    const user = req.user;
    if (!user) {
      console.error('createMultipleCalendarEvents: no authenticated user on request');
      return res.status(401).send('Not authenticated');
    }

    // Get an OAuth client for the user; this will refresh tokens if needed
    let client;
    try {
      client = await getOAuthClientForUser(user);
    } catch (err: any) {
      console.error('createMultipleCalendarEvents: user not authenticated with Google or refresh failed', err);
      return res.status(401).send('Not authenticated with Google');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });
    const { tasks } = req.body; // tasks: Array<{ summary: string, description?: string, start?: string, end?: string }>
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.error('Google Calendar: No tasks provided in request body.', req.body);
      return res.status(400).send('No tasks provided');
    }
    const results: any[] = [];
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
  } catch (err) {
    console.error('createMultipleCalendarEvents unexpected error:', err);
    res.status(500).send('Failed to create multiple events');
  }
};

export const googleAuth = (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  // Ensure state param is a string (fix TS error)
  let state: string | undefined = undefined;
  if (typeof req.query.state === 'string') {
    state = req.query.state;
  } else if (Array.isArray(req.query.state)) {
    const s = req.query.state[0];
    state = typeof s === 'string' ? s : String(s);
  } else if (req.query.state && typeof req.query.state === 'object') {
    // Defensive: handle ParsedQs (from qs library)
    try {
      state = String(req.query.state);
    } catch {
      state = undefined;
    }
  }
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state,
  });
  // TEMP DEBUG: log the full Google auth URL so we can inspect client_id & redirect_uri
  console.log('Generated Google auth URL:', url);
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const token = req.query.state as string || req.headers.authorization?.split(' ')[1];
  console.log('--- Google OAuth Callback Debug ---');
  console.log('Received code:', code);
  console.log('Received state param (JWT):', req.query.state);
  console.log('Received Authorization header:', req.headers.authorization);
  console.log('Token used for user lookup:', token);
  if (!code) {
    return res.status(400).send('<h2>Google Authentication Error</h2><p>No code provided from Google. Please try again.</p>');
  }
  if (!token) {
    console.error('No user token provided in state param or Authorization header.');
    return res.status(401).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:2rem;">
        <h2>Google Authentication Failed</h2>
        <p>No user token provided. Please <a href="http://localhost:5173">log in</a> to your account before connecting Google Calendar.</p>
      </body></html>
    `);
  }
  try {
    // Decode JWT to get user
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
    let decoded: any = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded JWT:', decoded);
    } catch (jwtErr) {
      console.error('JWT verification failed:', jwtErr);
      throw jwtErr;
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('User not found for decoded userId:', decoded.userId);
      return res.status(401).send('<h2>Google Authentication Error</h2><p>User not found. Please log in again.</p>');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Save tokens to user
    user.googleTokens = tokens;
    await user.save();

    // Determine redirect URL based on environment
    let frontendRedirect = 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production') {
      frontendRedirect = 'https://ai-tasks.netlify.app/';
    }
    if (process.env.FRONTEND_REDIRECT_URI) {
      frontendRedirect = process.env.FRONTEND_REDIRECT_URI;
    }
    res.redirect(frontendRedirect);
  } catch (err: any) {
    let message = 'Error exchanging code for tokens.';
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      message = 'Your login session expired or is invalid. Please log in again.';
    }
    res.status(500).send(`<h2>Google Authentication Error</h2><p>${message}</p>`);
  }
};

// Safe debug endpoint (non-secret): reports whether Google OAuth env vars are present
export const getGoogleConfig = (req: Request, res: Response) => {
  const resolved = process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_REDIRECT_URI_PROD || process.env.GOOGLE_REDIRECT_URI
    : process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD;
  res.json({
    clientIdPresent: !!process.env.GOOGLE_CLIENT_ID,
    clientSecretPresent: !!process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: resolved || null,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
};

// Create a calendar event (demo)
export const createCalendarEvent = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const client = await getOAuthClientForUser(user);
    const calendar = google.calendar({ version: 'v3', auth: client });
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
  } catch (err: any) {
    console.error('Create calendar event failed:', err);
    res.status(401).send('Not authenticated with Google');
  }
};

// List calendar events (demo)
export const listCalendarEvents = async (req: AuthRequest, res: Response) => {
  try {
    // Prevent browsers from caching the events response (avoids 304 Not Modified in Dev)
    res.setHeader('Cache-Control', 'no-store');
    const user = req.user;
    const client = await getOAuthClientForUser(user);
    const calendar = google.calendar({ version: 'v3', auth: client });
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
  } catch (err: any) {
    console.error('List calendar events failed:', err);
    res.status(401).send('Not authenticated with Google');
  }
};

// Safe debug endpoint — returns whether required Google env vars are present (no secrets)
export const googleConfigDebug = (req: Request, res: Response) => {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasRedirect = !!process.env.GOOGLE_REDIRECT_URI;
  // Masked client id for convenience (not exposing full value)
  const clientIdMasked = hasClientId && typeof process.env.GOOGLE_CLIENT_ID === 'string'
    ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 6)}...${process.env.GOOGLE_CLIENT_ID.slice(-6)}`
    : null;
  res.json({ hasClientId, hasClientSecret, hasRedirect, clientIdMasked });
};
