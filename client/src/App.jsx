import React, { useState } from 'react';
import ConnectForm from './Components/ConnectForm';
import ConnectedUsers from './Components/ConnectedUsers';
import IndividualChat from './Components/IndividualChat';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('user' + Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [targetUsername, setTargetUsername] = useState("");

  const handleConnect = (username) => {
    console.log(`Conectando o usuário: ${username} com userId: ${userId}`);

    const socketUrl = `ws://localhost:8000?username=${username}`;
    const ws = new WebSocket(socketUrl);

    setSocket(ws);

    ws.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(data);
      console.log('Mensagem recebida do servidor:', data);
    };

    ws.onclose = () => {
      console.log('Conexão WebSocket fechada');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    setUsername(username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '' && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      setMessage('');
    }
  };

  const handleSelectUser = (targetUser) => {
    setTargetUsername(targetUser);

  };

  const handleCloseChat = () => {
    setTargetUsername(null);
  };

  return (
    <div className="App">
      {!isConnected ? (
        <ConnectForm onConnect={handleConnect} />
      ) : (
        <div className="chat-container">
          <div className="username-section">
            <h1>Bem-vindo, {username}!</h1>
            <ConnectedUsers
              currentUser={username}
              onSelectUser={handleSelectUser}
              socket={socket}
            />
          </div>

          {/* Chats individuais */}
          {targetUsername ? (
            <IndividualChat
              key={targetUsername}
              targetUser={targetUsername}
              currentUser={username}
              socket={socket}
              onClose={handleCloseChat} // Isso já passa a função diretamente
            />
          ) : null}  {/* Caso targetSocketId seja falso, nada será renderizado */}

        </div>
      )}
    </div>
  );
}

export default App;
