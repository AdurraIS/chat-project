import { useState, useEffect } from 'react'
import './App.css'
import useWebSocket from 'react-use-websocket'

function App() {
  const [username, setUsername] = useState("")
  const [usernameInput, setUsernameInput] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  const ws_url = "ws://localhost:8000"
  const { sendMessage, lastMessage } = useWebSocket(ws_url, {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      setMessages(data);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput !== '' && usernameInput !== '') {
      if (!isConnected) {
        setIsConnected(true);
      }
      // Envia a mensagem normal
      sendMessage(JSON.stringify({message:messageInput, username: usernameInput}));
      
    } else {
      alert('Por favor, preencha seu nome de usuário e uma mensagem');
    }
  }

  return (
    <div className="chat-container">
      <div className="username-section">
        <input
          type="text"
          placeholder="Digite seu nome de usuário"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="username">{msg.username}: </span>
            <span className="message-text">{msg.message}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          placeholder="Digite sua mensagem"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}

export default App
