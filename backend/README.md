# AI Task Planner Backend

This is the backend for the AI Task Planner project, built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

## Features
- Express server with TypeScript
- MongoDB connection using Mongoose
- TaskPlan model for storing user goals and generated steps
- `/api/tasks` POST endpoint to create a new task plan (powered by ADK-TS agent)
- CORS enabled for frontend-backend integration (Netlify/Render)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file (see `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your-mongodb-uri
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

### Google Calendar MCP Expansion

This backend now exposes a reusable MCP (Model Context Protocol) wrapper for Google Calendar. It is located at `backend/src/mcp` and includes:

- `googleCalendarMcp.ts` — MCP controller with `metadata`, `query`, `act` and `docs` endpoints.
- `routes/googleMcpRoutes.ts` — route wiring under `/api/mcp/google-calendar`.
- `mcp/mcp.json` — machine-readable MCP manifest (discovery / submission).

Quick local test (assumes the backend is running and you have a user with Google tokens):

1. Start the backend:
```powershell
cd backend
npm run dev
```

2. Check metadata (no auth required):
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/mcp/google-calendar/metadata
```

3. Query or act using your app JWT (see auth endpoints in this README):
```powershell
# example: list upcoming events (replace <JWT>)
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/mcp/google-calendar/query -Headers @{ Authorization = 'Bearer <JWT>'; 'Content-Type' = 'application/json' } -Body (@{ query = @{ type = 'listUpcoming'; params = @{ maxResults = 5 } } } | ConvertTo-Json)
```

See `backend/mcp/README.md` for more details on the API shapes and how to include the MCP in ADK-TS submissions.

### New: Google Calendar & Auth notes
This backend now includes user authentication (register/login) with JWTs and Google Calendar integration:

- Required env variables (in addition to the above):
  - `JWT_SECRET` — secret for signing app JWTs
  - `GOOGLE_CLIENT_ID` — OAuth client ID from Google Cloud
  - `GOOGLE_CLIENT_SECRET` — OAuth client secret from Google Cloud
  - `GOOGLE_REDIRECT_URI` — backend callback URL (e.g., `http://localhost:5000/api/google/callback`)
  - `FRONTEND_REDIRECT_URI` — frontend base URL used when redirecting after OAuth

- Routes added:
  - `POST /api/auth/register` — create a user (returns app JWT)
  - `POST /api/auth/login` — login (returns app JWT)
  - `GET /api/google/auth` — starts Google OAuth flow (expects `state` to include app JWT)
  - `GET /api/google/callback` — OAuth callback (saves Google tokens to the user record)
  - `POST /api/google/event` — create a single calendar event (requires app JWT)
  - `POST /api/google/events/bulk` — create multiple events (requires app JWT)
  - `GET /api/google/events` — list upcoming events (requires app JWT)

Tokens are persisted on the user document (access_token + refresh_token + expiry_date). The server performs refreshes server-side and persists updates, so users don't need to re-auth frequently.

## Deployment

- Backend deployed on Render
- CORS enabled for Netlify frontend
- See main README for full-stack deployment status

## API Endpoints

- `POST /api/tasks` — Create a new task plan
  - Request body: `{ "goal": "Your goal here" }`
  - Response: `{ goal, steps, createdAt, _id }`

## Project Structure

- `src/models/TaskPlan.ts` — Mongoose model
- `src/controllers/taskController.ts` — Task logic
- `src/routes/taskRoutes.ts` — API routes
- `src/config/db.ts` — MongoDB connection
- `src/server.ts` — Express app entry point

## Next Steps
- Integrate ADK-TS agent for real task planning
- Add more endpoints as needed

---

For more details, see the main project README.
