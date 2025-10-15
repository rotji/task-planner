

import { useState } from 'react';
import Header from './components/Header';
import InputBox from './components/InputBox';
import OutputBox from './components/OutputBox';
import Footer from './components/Footer';
import { createTaskPlan, createCalendarEvent, listCalendarEvents, createMultipleCalendarEvents } from './services/api';
import './App.css';



function App() {
  // Add all tasks to Google Calendar
  const handleAddAllTasksToCalendar = async () => {
    if (!steps.length) return;
    setCalendarLoading(true);
    setCalendarMsg(null);
    try {
      // Map steps to event objects
      const tasks = steps.map((step, i) => ({
        summary: step,
        description: `Task ${i + 1} from AI Task Plan`,
      }));
      const results = await createMultipleCalendarEvents(tasks);
      const successCount = results.filter((r: any) => r.success).length;
      const msg = successCount === tasks.length
        ? `All ${tasks.length} tasks added to Google Calendar!`
        : successCount > 0
          ? `Added ${successCount} of ${tasks.length} tasks to Google Calendar.`
          : 'Failed to add any tasks to Google Calendar.';
      setCalendarMsg(msg);
      // Show popup/alert for user feedback
      if (successCount === tasks.length) {
        window.alert('All tasks successfully added to Google Calendar!');
      } else if (successCount > 0) {
        window.alert(`Some tasks added (${successCount}/${tasks.length}), some failed.`);
      } else {
        window.alert('Failed to add tasks to Google Calendar. Make sure you are connected.');
      }
      await handleListCalendarEvents();
    } catch (err) {
      setCalendarMsg('Failed to add tasks to calendar. Make sure you are connected.');
      window.alert('Failed to add tasks to Google Calendar. Make sure you are connected.');
    } finally {
      setCalendarLoading(false);
    }
  };
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar-related state moved inside App component
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarMsg, setCalendarMsg] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const handleGoalSubmit = async (goal: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTaskPlan(goal);
      setSteps(data.steps || []);
    } catch (err) {
      setError('Failed to generate task plan. Please try again.');
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = 'http://localhost:5000/api/google/auth';
  };

  const handleCreateCalendarEvent = async () => {
    setCalendarLoading(true);
    setCalendarMsg(null);
    try {
      const now = new Date();
      const start = new Date(now.getTime() + 3600000).toISOString();
      const end = new Date(now.getTime() + 7200000).toISOString();
      const event = await createCalendarEvent({
        summary: 'Test Event from UI',
        description: 'Created from React frontend',
        start,
        end,
      });
      setCalendarMsg('Event created: ' + event.summary);
      await handleListCalendarEvents();
    } catch (err) {
      setCalendarMsg('Failed to create event. Make sure you are connected.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleListCalendarEvents = async () => {
    setCalendarLoading(true);
    setCalendarMsg(null);
    try {
      const events = await listCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      setCalendarMsg('Failed to list events. Make sure you are connected.');
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        <button onClick={handleConnectGoogle} style={{ marginBottom: '1rem', background: '#4285F4', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}>
          Connect Google Calendar
        </button>
        <InputBox onSubmit={handleGoalSubmit} />
        {loading && <p>Generating plan...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <OutputBox steps={steps} />

        {/* Add all tasks to Google Calendar button */}
        {steps.length > 0 && (
          <button
            onClick={handleAddAllTasksToCalendar}
            disabled={calendarLoading}
            style={{ margin: '1rem 0', background: '#34A853', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: 'pointer' }}
          >
            Add all tasks to Google Calendar
          </button>
        )}

        <hr style={{ margin: '2rem 0' }} />
        <h3>Google Calendar Integration</h3>
        <button onClick={handleCreateCalendarEvent} disabled={calendarLoading} style={{ marginRight: 8 }}>
          Create Test Event
        </button>
        <button onClick={handleListCalendarEvents} disabled={calendarLoading}>
          List Upcoming Events
        </button>
        {calendarMsg && <p>{calendarMsg}</p>}
        {calendarEvents.length > 0 && (
          <ul style={{ marginTop: 16 }}>
            {calendarEvents.map(ev => (
              <li key={ev.id}>
                <strong>{ev.summary}</strong> <br />
                {ev.start?.dateTime || ev.start?.date} - {ev.end?.dateTime || ev.end?.date}
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
