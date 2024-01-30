import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inicio from './components/Login';
import Registro from './components/Registro';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

