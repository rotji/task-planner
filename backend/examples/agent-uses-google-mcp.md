# Example: Agent uses the Google Calendar MCP

This example shows the high-level steps an ADK-TS agent would take to schedule generated tasks using the MCP.

1. Generate tasks with ADK-TS (existing `createTaskPlan` does this).
2. Query MCP for free/busy windows:

POST /api/mcp/google-calendar/query
Body: `{ "query": { "type": "freeBusy", "params": { "timeMin": "<now>", "timeMax": "<+7d>" } } }`

3. Agent decides slots and calls `/api/mcp/google-calendar/act` to create events.

POST /api/mcp/google-calendar/act
Body: `{ "actions": [ { "type": "createEvent", "params": { "summary": "Task 1", "start": { "dateTime": "2025-10-20T09:00:00Z" }, "end": { "dateTime": "2025-10-20T09:30:00Z" } } ] }`

The MCP returns per-action results. Agents should verify successes and present failures back to the user.
