
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

import taskRoutes from './routes/taskRoutes';

app.use(express.json());

app.get('/', (req, res) => {
  res.send('AI Task Planner Backend is running!');
});

// Register task routes
app.use('/api', taskRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
