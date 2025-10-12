import { Request, Response } from 'express';
import TaskPlan from '../models/TaskPlan';

// Placeholder for ADK-TS agent logic
function generateTaskSteps(goal: string): string[] {
  // TODO: Replace with ADK-TS agent integration
  // For now, return mock steps
  return [
    `Define the goal: ${goal}`,
    'Break down the goal into smaller tasks',
    'Assign priorities to each task',
    'Set deadlines for each task',
    'Review and adjust the plan as needed',
  ];
}

export const createTaskPlan = async (req: Request, res: Response) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    const steps = generateTaskSteps(goal);
    const taskPlan = new TaskPlan({ goal, steps });
    await taskPlan.save();
    res.status(201).json(taskPlan);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
