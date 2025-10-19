import { Request, Response } from 'express';
import { google } from 'googleapis';
import User from '../models/User';

// Lightweight MCP-style wrapper over Google Calendar functionality.
// Endpoints are consumed by agents or other services. They expect the
// requesting service to supply a userId (or rely on the authenticated user via middleware).

// Helper: get OAuth client for a user (reuse logic from googleController if desired)
async function getOAuthClientForUser(user: any) {
  if (!user) throw new Error('No user provided');
  if (!user.googleTokens) throw new Error('No Google tokens stored for user');
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(user.googleTokens);
  // Note: token refresh is intentionally lightweight here; the existing googleController
  // contains a more robust refresh + persistence implementation. For MCP usage we call
  // that refresh via user.save() if needed in production.
  return client;
}

// GET /metadata
export const metadata = async (_req: Request, res: Response) => {
  res.json({
    name: 'google-calendar-mcp',
    version: '0.1.0',
    description: 'MCP wrapper providing calendar context and action endpoints for agents',
    capabilities: ['queryFreeBusy', 'listEvents', 'createEvent', 'bulkCreateEvents'],
    docs: '/api/mcp/google-calendar/docs',
  });
};

// POST /query
// Body: { userId?: string, query: { type: 'freeBusy' | 'listUpcoming', params?: any } }
export const query = async (req: Request, res: Response) => {
  try {
    const { userId, query } = req.body;
    if (!query || !query.type) return res.status(400).json({ error: 'Invalid query' });

    const user = userId ? await User.findById(userId) : (req as any).user;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const client = await getOAuthClientForUser(user);
    const calendar = google.calendar({ version: 'v3', auth: client });

    if (query.type === 'listUpcoming') {
      const resp = await calendar.events.list({
        calendarId: 'primary',
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: new Date().toISOString(),
        maxResults: query.params?.maxResults || 10,
      });
      return res.json(resp.data.items);
    }

    if (query.type === 'freeBusy') {
      const timeMin = query.params?.timeMin || new Date().toISOString();
      const timeMax = query.params?.timeMax || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      const resp = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        },
      });
      return res.json(resp.data);
    }

    return res.status(400).json({ error: 'Unknown query type' });
  } catch (err: any) {
    console.error('MCP query error', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

// POST /act
// Body: { userId?: string, actions: Array<{ type: 'createEvent', params: {...} }> }
export const act = async (req: Request, res: Response) => {
  try {
    const { userId, actions } = req.body;
    if (!Array.isArray(actions) || actions.length === 0) return res.status(400).json({ error: 'No actions' });

    const user = userId ? await User.findById(userId) : (req as any).user;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const client = await getOAuthClientForUser(user);
    const calendar = google.calendar({ version: 'v3', auth: client });

    const results: any[] = [];
    for (const a of actions) {
      if (a.type === 'createEvent') {
        const event = a.params;
        try {
          const response = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
          results.push({ success: true, event: response.data });
        } catch (err: any) {
          results.push({ success: false, error: err?.message || String(err) });
        }
      } else {
        results.push({ success: false, error: 'Unknown action type' });
      }
    }
    return res.json({ results });
  } catch (err: any) {
    console.error('MCP act error', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
};

// Simple docs endpoint
export const docs = (req: Request, res: Response) => {
  res.send(`
    <h2>Google Calendar MCP</h2>
    <p>Endpoints:</p>
    <ul>
      <li>GET /api/mcp/google-calendar/metadata</li>
      <li>POST /api/mcp/google-calendar/query</li>
      <li>POST /api/mcp/google-calendar/act</li>
    </ul>
  `);
};

export default { metadata, query, act, docs };
