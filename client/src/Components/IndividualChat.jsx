import React, { useState, useEffect } from 'react';
import './IndividualChat.css';

function IndividualChat({ targetUser, currentUser, socket, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        console.log("recebi")
        const data = JSON.parse(event.data);
        // Verifica se a mensagem é privada e se envolve o target atual
        if (data.type === 'private') {
          // Se a mensagem veio do target ou foi enviada para o target
       
            setMessages(prev => [...prev, data]);
            console.log("Mensagem recebida!")
            
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket, targetUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'private',
        from: currentUser,
        to: targetUser,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };
      socket.send(JSON.stringify(messageData));
      setMessage('');
      console.log("Mensagem enviada!")
    }
  };

  return (
    <div className="individual-chat">
      <div className="chat-header">
        <h2>Chat com {targetUser}</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.from === currentUser ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <span className="message-text">{msg.message}</span>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          placeholder="Digite sua mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default IndividualChat; 