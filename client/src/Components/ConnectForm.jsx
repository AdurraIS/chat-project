import React, { useState } from 'react';

function ConnectForm({ onConnect }) {
  const [username, setUsername] = useState('');

  // Função chamada quando o botão de conectar for clicado
  const handleConnect = () => {
    if (username.trim() === '') {
      alert('Por favor, insira um username!');
      return;
    }
    onConnect(username); // Chama a função passada por parâmetro com o username
  };

  return (
    <div>
      <h2>Conectar</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Digite seu username"
        required
      />
      <button onClick={handleConnect}>Conectar</button>
    </div>
  );
}

export default ConnectForm;
