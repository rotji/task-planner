
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';


const app = express();
const PORT = process.env.PORT || 5000;

// Allow Netlify and localhost for local development
app.use(cors({
  origin: [
    'https://ai-tasks.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));


import taskRoutes from './routes/taskRoutes';
import googleRoutes from './routes/googleRoutes';


app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI Task Planner Backend is running!');
});

// Register task routes

// Register Google OAuth2 routes
app.use('/api/google', googleRoutes);
app.use('/api', taskRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
