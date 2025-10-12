
import { useState } from 'react';
import Header from './components/Header';
import InputBox from './components/InputBox';
import OutputBox from './components/OutputBox';
import Footer from './components/Footer';
import { createTaskPlan } from './services/api';
import './App.css';


function App() {
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        <InputBox onSubmit={handleGoalSubmit} />
        {loading && <p>Generating plan...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <OutputBox steps={steps} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
