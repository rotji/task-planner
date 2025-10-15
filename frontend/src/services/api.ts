// Create multiple Google Calendar events from an array of tasks
export async function createMultipleCalendarEvents(tasks: { summary: string; description?: string; start?: string; end?: string }[]) {
  const response = await fetch(`${API_BASE_URL}/api/google/events/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to create multiple calendar events');
  }
  return response.json();
}
// Google Calendar API
export async function createCalendarEvent(event: { summary: string; description?: string; start: string; end: string }) {
  const response = await fetch(`${API_BASE_URL}/api/google/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to create calendar event');
  }
  return response.json();
}

export async function listCalendarEvents() {
  const response = await fetch(`${API_BASE_URL}/api/google/events`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to list calendar events');
  }
  return response.json();
}
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
