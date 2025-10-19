# Google Calendar MCP

This folder contains a lightweight MCP (Model Context Protocol) wrapper around Google Calendar that agents can query or ask to act upon.

Endpoints (relative to backend root):

- GET `/api/mcp/google-calendar/metadata` — returns metadata and capabilities.
- GET `/api/mcp/google-calendar/docs` — simple HTML docs.
- POST `/api/mcp/google-calendar/query` — query calendar context (free/busy, listUpcoming). Body: `{ userId?, query: { type: 'freeBusy'|'listUpcoming', params? } }`.
- POST `/api/mcp/google-calendar/act` — request actions (createEvent). Body: `{ userId?, actions: [{ type: 'createEvent', params: { summary, description, start: { dateTime }, end: { dateTime } } }] }`.

Auth
- Endpoints require the same JWT authentication used by the rest of the API. Agents running server-side can include a `userId` in the body and the server will look up tokens stored on the user.

Example agent usage (pseudo):

1. Agent asks MCP for free/busy for next 7 days:

POST /api/mcp/google-calendar/query
Body: `{ "query": { "type": "freeBusy", "params": { "timeMin": "2025-10-19T00:00:00Z", "timeMax": "2025-10-26T00:00:00Z" } } }`

2. Agent decides slots and requests creation:

POST /api/mcp/google-calendar/act
Body: `{ "actions": [{ "type": "createEvent", "params": { "summary": "Do research", "start": { "dateTime": "2025-10-20T09:00:00Z" }, "end": { "dateTime": "2025-10-20T10:00:00Z" } } }] }`

Notes
- This MCP is intentionally lightweight and meant to be a clear example you can extend. For production use, reuse the token refresh logic in `googleController` and add more robust error handling and rate limiting.
