import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      // Enviar la información de registro al servidor
      const response = await axios.post('http://localhost:3001/api/register', {
        username,
        password,
      });

      // Manejar la respuesta del servidor
      if (response.data.success) {
        console.log('Registro exitoso');
        // Redirigir al usuario al chat después de un registro exitoso
        navigate('/chat');  // Asegúrate de que '/chat' sea la ruta correcta para tu chat
      } else {
        console.error('Error en el registro:', response.data.error);
        // Manejar el error de registro
      }
    } catch (error) {
      console.error('Error al enviar la solicitud de registro:', error);
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <br />
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <br />
      <button onClick={handleRegister}>Registrar</button>
    </div>
  );
};

export default Register;

