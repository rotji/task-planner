import React, { useState } from 'react';

interface RegisterProps {
  onRegister: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        window.alert(data.error || 'Registration failed');
        return;
      }
      setSuccess(true);
      window.alert('Registration successful! Please log in.');
      onRegister();
    } catch (err: unknown) {
      console.error('Registration error', err);
      setError('Registration failed');
      window.alert('Registration failed');
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
      <h2 style={{ color: '#4285F4', textAlign: 'center', marginBottom: 8 }}>Register</h2>
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
          background: 'linear-gradient(90deg, #4285F4 60%, #34A853 100%)',
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
        Register
      </button>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>Registration successful! Please log in.</p>}
    </form>
  );
};

export default Register;
