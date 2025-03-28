import React, { useState } from 'react';
import ConnectForm from './Components/ConnectForm';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('user' + Date.now()); // Gera um userId único (você pode melhorar essa lógica)
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null); // Para armazenar a instância do WebSocket

  // Função que será chamada quando o usuário se conectar
  const handleConnect = (username) => {
    console.log(`Conectando o usuário: ${username} com userId: ${userId}`);

    // Conectar ao WebSocket usando query parameters
    const socketUrl = `ws://localhost:8000?username=${username}`;
    const ws = new WebSocket(socketUrl);

    // Salvar a instância do WebSocket
    setSocket(ws);

    // Configurar os eventos do WebSocket
    ws.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log('Mensagem recebida do servidor:', event.data);
    };

    ws.onclose = () => {
      console.log('Conexão WebSocket fechada');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    // Armazenar o username e userId no estado
    setUsername(username);
  };

  return (
    <div>
      {!isConnected ? (
        <ConnectForm onConnect={handleConnect} />
      ) : (
        <div>
          <h1>Bem-vindo, {username}!</h1>
          <p>Você está conectado com o WebSocket.</p>
          {/* Exemplo de exibição de mensagens do WebSocket */}
        </div>
      )}
    </div>
  );
}

export default App;
