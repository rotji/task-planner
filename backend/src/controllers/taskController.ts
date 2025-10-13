import { Request, Response } from 'express';

import TaskPlan from '../models/TaskPlan';
import { AgentBuilder } from '@iqai/adk';

export const createTaskPlan = async (req: Request, res: Response) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    // Use ADK-TS AgentBuilder to generate task steps
    const agentResponse: any = await AgentBuilder
      .withModel('gpt-4.1') // You can change to your preferred model
      .ask(`Break down the following goal into actionable steps as a numbered list: ${goal}`);

    // Extract steps from agent response (assuming numbered list)
    let steps: string[] = [];
    if (typeof agentResponse === 'string') {
      steps = agentResponse
        .split(/\n|\r/)
        .map((line: string) => line.replace(/^\d+\.?\s*/, '').trim())
        .filter((line: string) => line.length > 0);
    } else if (Array.isArray(agentResponse)) {
      steps = (agentResponse as any[]).map((item: any) => String(item));
    }

    const taskPlan = new TaskPlan({ goal, steps });
    await taskPlan.save();
    res.status(201).json(taskPlan);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : error });
  }
};
