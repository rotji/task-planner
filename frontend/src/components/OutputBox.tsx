import React from 'react';
import styles from './OutputBox.module.css';

type Props = {
  steps: string[];
};

const OutputBox: React.FC<Props> = ({ steps }) => (
  <div className={styles.outputBox}>
    <h2>Task Steps</h2>
    {steps.length === 0 ? (
      <p>No steps generated yet.</p>
    ) : (
      <ol>
        {steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    )}
  </div>
);

export default OutputBox;
