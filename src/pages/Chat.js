import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chat.css';

const ChatApp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentStyle, setCurrentStyle] = useState('light');
  const [availableThemes] = useState(['light', 'dark']);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchOnlineUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/onlineUsers',{timeout:5000});
        if(isMounted){
          setOnlineUsers(response.data.onlineUsers);
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.error('Tiempo de espera agotado al obtener la cantidad de usuarios en línea.');
        } else {
          console.error('Error al obtener la cantidad de usuarios en línea:', error);
        }
      }
    };

    const fetchRegisteredUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/registeredUsers');
        setRegisteredUsers(response.data.registeredUsers);
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.error('Tiempo de espera agotado al obtener la cantidad de usuarios registrados.');
        } else {
          console.error('Error al obtener la cantidad de usuarios registrados:', error);
        }
      }
    };
    
    const waitForRegisteredUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/waitForRegisteredUsers');
        // La solicitud se resuelve cuando hay un cambio en los usuarios registrados
        // Vuelve a llamar a la función para obtener la última cantidad
        setRegisteredUsers(response.data.registeredUsers);
        // Luego, vuelva a iniciar la espera para futuros cambios
        waitForRegisteredUsers();
        console.log("Aquí está");
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.error('Tiempo de espera agotado al esperar la actualización de usuarios registrados.');
        } else {
          console.error('Error al esperar la actualización de usuarios registrados:', error);
        }
        // Vuelve a iniciar la espera para futuros cambios
        waitForRegisteredUsers();
      }
    };
    const onlineUsersInterval = setInterval(() => {
      if (ws.current.readyState === WebSocket.OPEN) {
        // Solicitar onlineUsers solo si la conexión WebSocket está abierta
        fetchOnlineUsers();
      }
    }, 2000);
    
    // Obtener mensajes al cargar el componente
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/waitForMessages', { timeout: 10000 });
        const responseData = response.data;
    
        // Verificar que responseData es un array antes de asignarlo a messages
        if (Array.isArray(responseData)) {
          setMessages(responseData);
          scrollToBottom();
        } else {
          console.error('La respuesta no es un array de mensajes:', responseData);
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          console.error('Tiempo de espera agotado al obtener los mensajes.');
        } else {
          console.error('Error al obtener la cantidad de usuarios en línea:', error);
        }
      }
    };

    fetchMessages();
    waitForRegisteredUsers();
    // WebSocket - Inicialización y uso de eventListener
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'messages') {
        setMessages(data.data);
        scrollToBottom();
      } else if (data.event === 'userList') {
        setUsers(data.data);
      } else if (data.event === 'onlineUsers') {
        setOnlineUsers(data.data);
      }else if (data.event === 'message') {
        // Agrega el nuevo mensaje al estado
        setMessages((prevMessages) => [...prevMessages, data.data]);
        scrollToBottom();
      }      
    });

    // Llamada inicial a fetchRegisteredUsers
    fetchRegisteredUsers();
    return () => {
      clearInterval(onlineUsersInterval);
      ws.current.close();
      isMounted=false;
    };
  }, []);

  const handleSendMessage = () => {
    const newMessage = {
      username: username,
      message: message || '',
    };

    ws.current.send(JSON.stringify(newMessage));

    //setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
    scrollToBottom();
  };

  const changeTheme = (theme) => {
    setCurrentStyle(theme);
  };

  const handleLogout = () => {
    // Cerrar la conexión WebSocket
    if(ws.current){
      ws.current.close();
      if(!ws.current){
        console.log.out('Socket Cerrado');
      }
    }else{
      console.log.out("No hay conexiones WS")
    }
    // Limpiar el estado
    setUsername('');
    setMessage('');
    setMessages([]);
    setUsers([]);
    // Redirigir al usuario a la página de inicio de sesión
    navigate('/');
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className={`chat-container ${currentStyle}`}>
      <div className="chat-header">
        <h1>Chat en Tiempo Real</h1>
        <p>Usuarios en línea: {onlineUsers}</p>
        <p>Usuarios registrados: {registeredUsers}</p>
        <div className="theme-selector">
          <span>Themes: </span>
          {availableThemes.map((theme) => (
            <button key={theme} onClick={() => changeTheme(theme)}>{theme}</button>
          ))}
        </div>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <div className="chat-content">
        <div className="message-list">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}>
                <div className="message-content-container">
                  <div className="message-content">{msg.message} {msg.emoticon && <span>{msg.emoticon}</span>}</div>
                </div>
                <div className="message-sender">{msg.username}</div>
              </li>
            ))}
          </ul>
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
