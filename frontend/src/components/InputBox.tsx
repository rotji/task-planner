import React, { useState } from 'react';
import styles from './InputBox.module.css';

type Props = {
  onSubmit: (goal: string) => void;
};

const InputBox: React.FC<Props> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal);
      setGoal('');
    }
  };

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Enter your goal..."
        value={goal}
        onChange={e => setGoal(e.target.value)}
      />
      <button className={styles.button} type="submit">Plan</button>
    </form>
  );
};

export default InputBox;
