import React from 'react';
import styles from './Header.module.css';


const Header: React.FC = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1>AI Task Planner</h1>
      <p>Break down your goals into actionable steps with AI</p>
    </div>
  </header>
);

export default Header;
