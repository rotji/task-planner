

import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Header from './components/Header';
import InputBox from './components/InputBox';
import OutputBox from './components/OutputBox';
import Footer from './components/Footer';
import { createTaskPlan, listCalendarEvents, createMultipleCalendarEvents } from './services/api';
import './App.css';



function App() {
  const [jwt, setJwt] = useState<string | null>(() => localStorage.getItem('jwt'));
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(!localStorage.getItem('jwt'));

  // On mount / when jwt changes, check if JWT is valid (basic check: must be a non-empty string)
  useEffect(() => {
    if (!jwt || typeof jwt !== 'string' || jwt.length < 10) { // crude check, adjust as needed
      setJwt(null);
      localStorage.removeItem('jwt');
      setShowLogin(true);
      setShowRegister(false);
    }
  }, [jwt]);

  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar-related state moved inside App component
  type CalendarEvent = {
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    htmlLink?: string;
  };
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarMsg, setCalendarMsg] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

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
      // Confirm with the user before creating many events
      const confirmed = window.confirm(`Add ${tasks.length} tasks to your Google Calendar?`);
      if (!confirmed) {
        setCalendarLoading(false);
        return;
      }

  const results = await createMultipleCalendarEvents(tasks) as Array<{ success: boolean; id?: string; error?: string }>;
  const successCount = results.filter((r) => r.success).length;
      const msg = successCount === tasks.length
        ? `All ${tasks.length} tasks added to Google Calendar!`
        : successCount > 0
          ? `Added ${successCount} of ${tasks.length} tasks to Google Calendar.`
          : 'Failed to add any tasks to Google Calendar.';
      setCalendarMsg(msg);
      // Show popup/alert for user feedback
      if (successCount === tasks.length) {
        showToast('All tasks successfully added to Google Calendar!');
      } else if (successCount > 0) {
        showToast(`Some tasks added (${successCount}/${tasks.length})`);
      } else {
        showToast('Failed to add tasks to Google Calendar. Make sure you are connected.');
      }
      await handleListCalendarEvents();
    } catch (err: unknown) {
      console.error('Error adding tasks to calendar', err);
      setCalendarMsg('Failed to add tasks to calendar. Make sure you are connected.');
      showToast('Failed to add tasks to Google Calendar. Make sure you are connected.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleGoalSubmit = async (goal: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createTaskPlan(goal);
      setSteps(data.steps || []);
    } catch (err) {
      console.error('Error generating task plan', err);
      setError('Failed to generate task plan. Please try again.');
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    if (!jwt || typeof jwt !== 'string' || jwt.length < 10) {
      window.alert('Please log in first. (No valid user token found)');
      return;
    }
    // Use environment variables for API URL and Google Auth path
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const googleAuthPath = import.meta.env.VITE_GOOGLE_AUTH_PATH || '/api/google/auth';
    const url = `${apiUrl.replace(/\/$/, '')}${googleAuthPath}?state=${encodeURIComponent(jwt)}`;
    console.log('Redirecting to Google with JWT in state param:', jwt);
    window.location.href = url;
  };

  

  const handleListCalendarEvents = async () => {
    setCalendarLoading(true);
    setCalendarMsg(null);
    try {
      const events = await listCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      console.error('Error listing calendar events', err);
      setCalendarMsg('Failed to list events. Make sure you are connected.');
    } finally {
      setCalendarLoading(false);
    }
  };

  // Modal overlay for login/register
  const showAuthModal = !jwt && (showLogin || showRegister);


  // Standard UX: Only show authentication screen (centered, with branding) if not logged in
  if (!jwt) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo-ai-task-planner.svg" alt="AI Task Planner Logo" style={{ width: 64, marginBottom: 12 }} />
          <h1 style={{ color: '#2563eb', fontWeight: 700, fontSize: 32, margin: 0 }}>AI Task Planner</h1>
          <p style={{ color: '#555', margin: 0 }}>Break down your goals into actionable steps with AI</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 16px #4285F440', padding: '2.5rem 2rem', minWidth: 340, maxWidth: 380, width: '100%', position: 'relative' }}>
          {showRegister ? (
            <Register onRegister={() => { setShowRegister(false); setShowLogin(true); }} />
          ) : (
            <Login onLogin={token => {
              setJwt(token);
              localStorage.setItem('jwt', token);
              setShowLogin(false);
            }} />
          )}
          {showRegister ? (
            <button onClick={() => { setShowRegister(false); setShowLogin(true); }} style={{ marginTop: 8, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Already have an account? Login</button>
          ) : (
            <button onClick={() => { setShowRegister(true); setShowLogin(false); }} style={{ marginTop: 8, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>No account? Register</button>
          )}
        </div>
        <div style={{ marginTop: 32, color: '#aaa', fontSize: 14 }}>© {new Date().getFullYear()} AI Task Planner</div>
      </div>
    );
  }

  // Main app content if authenticated
  return (
    <div>
      <Header
        isLoggedIn={!!jwt && typeof jwt === 'string' && jwt.length >= 10}
        onShowLogin={() => { setShowLogin(true); setShowRegister(false); }}
        onShowRegister={() => { setShowRegister(true); setShowLogin(false); }}
        onLogout={() => {
          setJwt(null);
          localStorage.removeItem('jwt');
          setShowLogin(true);
          setShowRegister(false);
        }}
        showAuthButtons={!showAuthModal}
      />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Only show if JWT is present and valid */}
        <button
          onClick={handleConnectGoogle}
          disabled={!jwt || typeof jwt !== 'string' || jwt.length < 10}
          style={{ marginBottom: '1rem', background: '#4285F4', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 4, cursor: (!jwt || typeof jwt !== 'string' || jwt.length < 10) ? 'not-allowed' : 'pointer', opacity: (!jwt || typeof jwt !== 'string' || jwt.length < 10) ? 0.6 : 1 }}
        >
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
            title="Add all generated tasks from this plan into your connected Google Calendar"
            style={{ margin: '1rem 0', background: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1.1rem', borderRadius: 6, cursor: 'pointer', minWidth: 260, fontWeight: 600 }}
          >
            Add generated tasks to Google Calendar
          </button>
        )}

        {/* Helper callout for calendar controls */}
        <div role="note" aria-live="polite" style={{ background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '0.75rem 1rem', borderRadius: 8, color: '#0f172a', fontSize: 13, maxWidth: 640, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ marginRight: 8 }}>Calendar controls</strong>
            <span title="Upcoming Tasks shows remaining tasks scheduled in the future (from Google Calendar) so you can review dates and details." style={{ fontSize: 14, lineHeight: 1, color: '#2563eb', cursor: 'help' }}>ℹ️</span>
          </div>
          <span>Upcoming Tasks: shows remaining tasks scheduled in the future (from your connected Google Calendar) so you can review dates and details for tasks you still need to accomplish.</span>
        </div>

        <hr style={{ margin: '2rem 0' }} />
        <h3>Google Calendar Integration</h3>
        <button onClick={handleListCalendarEvents} disabled={calendarLoading} title="Fetch upcoming events from your Google Calendar" style={{ padding: '0.5rem 0.9rem', minWidth: 200, borderRadius: 6, fontWeight: 600 }}>
          Upcoming Tasks
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
        {/* Toast notification */}
        {toast && (
          <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#111827', color: 'white', padding: '0.75rem 1rem', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            {toast}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


export default App;
