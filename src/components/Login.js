import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importar Link
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

    const handleLogin = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/login', {
          username: username,
          password: password,
        });
    
        if (response.data.success) {
          // Autenticación exitosa
          if (typeof onClick === 'function') {
            onLogin(username);
          } else {
            //console.error('Error: onLogin no es una función');
          }
          setError('');
          // Redirigir a la página de chat después del inicio de sesión exitoso
          navigate('/chat');
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud de inicio de sesión:', error);
      }
    };
  

  return (
    <div style={{ width: '50%', margin: 'auto', textAlign: 'center' }}>
      <h2>Login</h2>
      <form method='POST' style={{ maxWidth: '300px', margin: 'auto' }}>
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

        {/* Enlace a la página de registro */}
        <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </form>
    </div>
  );
};

export default Login;
