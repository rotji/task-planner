import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.footerContent}>
      <span>&copy; {new Date().getFullYear()} AI Task Planner. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
