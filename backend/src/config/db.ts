import mongoose from 'mongoose';

console.log('DEBUG: process.env.MONGO_URI =', process.env.MONGO_URI);
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-task-planner';
console.log('DEBUG: MONGODB_URI =', MONGODB_URI);

export const connectDB = async () => {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
