# AI Task Planner

A full-stack hackathon project for the ADK-TS Hackathon 2025. This project helps users break down goals into actionable steps using an AI agent.

## Structure
- `frontend/` — Vite + React + TypeScript UI
- `backend/` — Node.js + Express + TypeScript + MongoDB API

## Progress
- [x] Initialize frontend (Vite + React + TypeScript)
- [x] Initialize backend (Node + Express + TypeScript)
- [x] Setup .env and folder structure
- [x] Setup database connection (Mongoose, MongoDB)
- [x] Create TaskPlan model
- [x] Implement /api/tasks POST route (ADK-TS agent integrated)
- [x] Integrate ADK-TS agent
- [x] Build frontend UI (Landing, Dashboard, CSS Modules)
- [x] Connect frontend to backend
- [x] Deploy MVP

## Getting Started
See `frontend/README.md` and `backend/README.md` for setup instructions.

## Recent updates
This repository now includes a Google Calendar integration and user authentication flow.

- Per-user Google OAuth2 integration (server-side): users can connect their Google account and the backend securely stores per-user Google access and refresh tokens in MongoDB.
- Server-side token refresh: the backend refreshes Google access tokens when needed and persists updated tokens to the user record.
- Calendar endpoints: authenticated users can create single events, bulk-create events from generated task plans, and list upcoming events from their Google Calendar.
- JWT-based app authentication: register/login endpoints, JWT issuance, and a `requireAuth` middleware protect calendar and user routes.

See `backend/README.md` and `frontend/README.md` for details on env vars, running locally, and OAuth redirect configuration.

---

This project is built step-by-step following a clear roadmap for hackathon success.
