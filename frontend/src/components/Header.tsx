
import React from 'react';
import styles from './Header.module.css';


interface HeaderProps {
  isLoggedIn: boolean;
  onShowLogin: () => void;
  onShowRegister: () => void;
  onLogout?: () => void;
  showAuthButtons?: boolean;
}


const Header: React.FC<HeaderProps> = ({ isLoggedIn, onShowLogin, onShowRegister, onLogout, showAuthButtons = true }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1>AI Task Planner</h1>
      <p>Break down your goals into actionable steps with AI</p>
      <div style={{ position: 'absolute', top: 16, right: 32 }}>
        {isLoggedIn ? (
          <button onClick={onLogout} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        ) : (
          showAuthButtons && <>
            <button onClick={onShowLogin} style={{ marginRight: 8, background: '#34A853', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer' }}>Login</button>
            <button onClick={onShowRegister} style={{ background: '#4285F4', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer' }}>Register</button>
          </>
        )}
      </div>
    </div>
  </header>
);

export default Header;
