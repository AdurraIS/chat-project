import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './ConnectedUsers.css';

function ConnectedUsers({ currentUser, onSelectUser, socket }) {
  const [connectedUsers, setConnectedUsers] = useState([]);


  useEffect(() => {

    // Configura o listener para mensagens do WebSocket
    if (socket) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newConnection') {
          console.log('Nova conexão detectada, atualizando lista...');
          setConnectedUsers(data.connectedUsers);
        }
      };

      socket.addEventListener('message', handleMessage);

      // Cleanup function
      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, [currentUser, socket]);

  return (
    <div className="connected-users">
      <h3>Usuários Conectados ({connectedUsers.length})</h3>
      <ul>
        {connectedUsers.map((user) => (
          <li 
            key={user.id} 
            className={`user-item ${user.username === currentUser ? 'current-user' : ''}`}
            onClick={() => user.username !== currentUser && onSelectUser(user.username, user.socketId)}
          >
            <span className="user-name">{user.username} {user.username === currentUser && '(Você)'}</span>
            <span className="connection-status">●</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConnectedUsers; 