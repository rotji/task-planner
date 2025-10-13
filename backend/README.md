# AI Task Planner Backend

This is the backend for the AI Task Planner project, built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

## Features
- Express server with TypeScript
- MongoDB connection using Mongoose
- TaskPlan model for storing user goals and generated steps
- `/api/tasks` POST endpoint to create a new task plan (mock agent logic for now)
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
