const http = require('http')
const { WebSocketServer } = require('ws')

const url = require(`url`);
const { parse } = require('path');

const port = 8000;

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

let messagesList = []
let activeConnections = []

wsServer.on(`connection`, (connection)=>{
    
    let username = '';  // Inicializa o username como vazio.

    connection.on('message', (message) => {
        // Parse a mensagem e define o username se não estiver setado
        const parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        if (!username && parsedMessage.username) {
            username = parsedMessage.username; // Define o username
        }

        // Adiciona a mensagem à lista com o username
        messagesList.push({
            message: parsedMessage.message,
            username: username
        });
        // Broadcast para todos os clientes conectados
        activeConnections.forEach(client => {
            if (client.connection.readyState === client.connection.OPEN) {
                client.connection.send(JSON.stringify(messagesList));
            }
        });
    });

    // Remove a conexão quando o cliente desconecta
    connection.on('close', () => {
        activeConnections = activeConnections.filter(conn => conn !== connection)
    })
    activeConnections.push({ connection, username });
})

server.listen(port, () => {
    console.log(`WebSocket server is running on port: ${port}`)
})

