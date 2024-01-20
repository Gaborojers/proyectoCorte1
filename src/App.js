import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './styles/Chat.css';

const port = 3001; // Puerto único para ambos WebSocket y HTTP
const socket = io(`http://localhost:${port}`);

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Obtener mensajes desde el servidor al cargar la página
    axios.get(`http://localhost:3001/api/messages`, { withCredentials: true })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener mensajes:', error);
      });

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
  }, []);

  const handleSendMessage = () => {
    if (message.trim() === '') {
      return;
    }

    const newMessage = {
      username: username,
      message: message,
    };

    socket.emit('sendMessage', newMessage);

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat en Tiempo Real</h1>
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
