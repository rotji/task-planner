// Helper to get JWT from localStorage
function getAuthHeaders(): { [key: string]: string } {
  const jwt = localStorage.getItem('jwt');
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

// Safely parse JSON responses. If response is empty or not JSON, return null or raw text.
async function safeParseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON
    return text;
  }
}
export { safeParseBody };

// Create multiple Google Calendar events from an array of tasks
export async function createMultipleCalendarEvents(tasks: { summary: string; description?: string; start?: string; end?: string }[]) {
  const response = await fetch(`${API_BASE_URL}/api/google/events/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ tasks }),
  });
  // Handle unauthorized separately so the UI can prompt re-authentication
  if (response.status === 401) {
    console.error('Unauthorized: JWT is missing or expired. Please log in again.');
    // Optionally remove invalid token from storage so UI shows login state
    localStorage.removeItem('jwt');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const body = await safeParseBody(response);
    throw new Error('Failed to create multiple calendar events: ' + (body && (body.error || body.message || String(body))));
  }
  return safeParseBody(response);
}
// Google Calendar API
export async function createCalendarEvent(event: { summary: string; description?: string; start: string; end: string }) {
  const response = await fetch(`${API_BASE_URL}/api/google/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    const body = await safeParseBody(response);
    throw new Error('Failed to create calendar event: ' + (body && (body.error || body.message || String(body))));
  }
  return safeParseBody(response);
}

export async function listCalendarEvents() {
  const response = await fetch(`${API_BASE_URL}/api/google/events`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    const body = await safeParseBody(response);
    throw new Error('Failed to list calendar events: ' + (body && (body.error || body.message || String(body))));
  }
  return safeParseBody(response);
}
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function createTaskPlan(goal: string) {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goal }),
  });
  if (!response.ok) {
    const body = await safeParseBody(response);
    throw new Error('Failed to create task plan: ' + (body && (body.error || body.message || String(body))));
  }
  return safeParseBody(response);
}
