import React, { useState } from 'react';
import { safeParseBody } from '../services/api';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeParseBody(res);
      if (!res.ok) {
        const msg = data && (data.error || data.message) ? (data.error || data.message) : res.statusText;
        setError(msg || 'Login failed');
        window.alert(msg || 'Login failed');
        return;
      }
      window.alert('Login successful!');
      if (data && (data.token || data.token)) onLogin(data.token);
    } catch (err: unknown) {
      console.error('Login error', err);
      setError('Login failed');
      window.alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 400,
      margin: '2rem auto',
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 2px 16px #4285F440',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h2 style={{ color: '#34A853', textAlign: 'center', marginBottom: 8 }}>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
      />
      <button
        type="submit"
        style={{
          background: 'linear-gradient(90deg, #34A853 60%, #4285F4 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '0.75rem',
          fontWeight: 600,
          fontSize: 18,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        Login
      </button>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </form>
  );
};

export default Login;
