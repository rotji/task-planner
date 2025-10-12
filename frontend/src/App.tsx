import React, { useState } from 'react';

import Header from './components/Header';
import InputBox from './components/InputBox';
import OutputBox from './components/OutputBox';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [steps, setSteps] = useState<string[]>([]);

  // For now, mock the agent response
  const handleGoalSubmit = (goal: string) => {
    setSteps([
      `Define the goal: ${goal}`,
      'Break down the goal into smaller tasks',
      'Assign priorities to each task',
      'Set deadlines for each task',
      'Review and adjust the plan as needed',
    ]);
  };

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        <InputBox onSubmit={handleGoalSubmit} />
        <OutputBox steps={steps} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
