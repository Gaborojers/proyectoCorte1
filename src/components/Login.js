import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Lógica simple de usuario fijo para este ejemplo
    if (username === 'Gabo' && password === 'LgSc0604') {
      onLogin(username);
      setError('');

      // Redirigir a la página de chat después del inicio de sesión exitoso
      navigate('/chat');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{ width: '50%', margin: 'auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <form style={{ maxWidth: '300px', margin: 'auto' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%' }} />
        </label>
        <br />
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
        </label>
        <br />
        <button type="button" onClick={handleLogin} style={{ width: '100%' }}>
          Login
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
