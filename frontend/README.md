
# AI Task Planner Frontend

This is the frontend for the AI Task Planner project, built with React, TypeScript, and Vite.

## Features
- Landing page and dashboard UI
- Input for user goal, submit button, and output area
- CSS Modules for component styling
- Connects to backend API for task planning

## Usage

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file:
   ```env
   VITE_API_URL=https://task-planner-ut61.onrender.com
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

### Google Calendar integration (frontend notes)
The frontend now supports connecting a user to Google Calendar and managing events:

- `Connect Google Calendar` button: starts the OAuth flow. The frontend includes your app JWT in the OAuth `state` parameter so the backend can associate Google tokens with the correct user.
- `Upcoming Tasks` button: fetches upcoming events from the connected Google Calendar and displays them in the UI (these represent remaining tasks with future dates).
- `Add generated tasks to Google Calendar`: after generating a plan, this button bulk-creates calendar events for each generated step (requires the user to be connected to Google Calendar).

Required env variables for frontend:
- `VITE_API_URL` — the backend base URL (e.g., `http://localhost:5000` during local dev)
- `VITE_GOOGLE_AUTH_PATH` (optional) — if you change the backend Google auth path (defaults to `/api/google/auth`)

Notes:
- Ensure the backend's `GOOGLE_REDIRECT_URI` is configured in your Google Cloud OAuth consent screen and matches the callback URL used by the server.
- If you see a 401 from the bulk-add endpoint, the frontend will clear the local JWT and prompt the user to log in again (this indicates the user needs to re-auth or reconnect Google).

## Deployment

- Frontend deployed on Netlify
- Uses VITE_API_URL to connect to backend

---

See main project README for full-stack setup and deployment status.

## Upcoming Feature

- Google Calendar integration: Schedule tasks directly from the planner UI (in progress)
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
