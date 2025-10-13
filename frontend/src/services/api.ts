const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function createTaskPlan(goal: string) {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goal }),
  });
  if (!response.ok) {
    throw new Error('Failed to create task plan');
  }
  return response.json();
}
