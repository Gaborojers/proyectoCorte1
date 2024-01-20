import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/Chat.css';
import Login from './Login';

const port = 3001; // Puerto único para ambos WebSocket y HTTP

const socket = io(`http://localhost:${port}`);

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Configura la escucha del socket solo si hay un usuario autenticado
    if (loggedInUser) {
      socket.on('message', (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      });

      socket.on('userList', (onlineUsers) => {
        setUsers(onlineUsers);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [loggedInUser]);

  const handleSendMessage = () => {
    if (message.trim() === '') {
      return;
    }

    const newMessage = {
      username: loggedInUser.username,
      message: message,
    };

    socket.emit('sendMessage', newMessage);

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = (user) => {
    setLoggedInUser(user);
    setUsername(user.username);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'GET',
        credentials: 'include', // Importante para manejar las cookies de sesión
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedInUser(null);
        setUsername('');
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat en Tiempo Real</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div className="chat-content">
        <div className="user-list">
          <h2>Usuarios en línea:</h2>
          <ul>
            {users.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </div>
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.username === username ? 'own-message' : ''}`}>
              <strong>{msg.username}:</strong> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Escribe tu mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatApp;
