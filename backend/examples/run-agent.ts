import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { AgentBuilder } from '@iqai/adk';

dotenv.config();

const API_BASE = process.env.EXAMPLE_API_URL || process.env.VITE_API_URL || 'http://localhost:5000';
const JWT = process.env.EXAMPLE_JWT || '';

async function api(path: string, opts: any = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(JWT ? { Authorization: `Bearer ${JWT}` } : {}),
    },
    ...opts,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function main() {
  if (!JWT) {
    console.error('Please set EXAMPLE_JWT (server user JWT) in env before running this demo.');
    process.exit(1);
  }

  // 1) Generate tasks with ADK-TS (simple local call to AgentBuilder)
  console.log('Generating tasks for goal: "Prepare talk on AI agents"');
  const agentResp: any = await AgentBuilder
    .withModel('gemini-2.5-flash')
    .ask('Break down the following goal into 5 actionable steps: Prepare a 20-minute talk on AI agents');
  let steps: string[] = [];
  if (typeof agentResp === 'string') {
    steps = agentResp.split(/\n|\r/).map(s => s.replace(/^\d+\.?\s*/, '').trim()).filter(Boolean);
  } else if (Array.isArray(agentResp)) {
    steps = agentResp.map(String);
  }
  console.log('Generated steps:', steps);

  // 2) Query MCP for free/busy next 7 days
  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
  console.log('Querying MCP for free/busy...');
  const fb = await api('/api/mcp/google-calendar/query', {
    method: 'POST',
    body: JSON.stringify({ query: { type: 'freeBusy', params: { timeMin, timeMax } } }),
  });
  console.log('FreeBusy response:', JSON.stringify(fb).slice(0, 1000));

  // 3) Naive slot allocation: pick next available hours by starting at now +1h
  const actions: any[] = [];
  let cursor = new Date(now.getTime() + 3600000);
  for (let i = 0; i < Math.min(steps.length, 5); i++) {
    const start = new Date(cursor);
    const end = new Date(start.getTime() + 30 * 60000);
    actions.push({
      type: 'createEvent',
      params: {
        summary: steps[i],
        description: `Auto-scheduled by example agent for step ${i+1}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      }
    });
    cursor = new Date(end.getTime() + 15 * 60000);
  }

  console.log('Requesting MCP to create events...');
  const r = await api('/api/mcp/google-calendar/act', {
    method: 'POST',
    body: JSON.stringify({ actions }),
  });
  console.log('Create results:', JSON.stringify(r, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
