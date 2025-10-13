
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
