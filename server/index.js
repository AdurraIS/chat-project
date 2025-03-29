const { getConnectedUsers, deleteDocFromConnection, persistConnection, getSocketIdByUsername, findSocketById } = require('./firebase');
const http = require('http')
const { WebSocketServer } = require('ws')
const url = require(`url`);

const port = 8000;

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

let activeConnections = []

wsServer.on(`connection`, (connection, request) => {
    const userId = 'user' + Date.now();
    const socketId = 'socket' + Date.now();
    const { username } = url.parse(request.url, true).query;
    connection.socketId = socketId;
    persistConnection(userId, socketId, username);

    // Envia a nova conexão e lista de usuários para todos
    getConnectedUsers().then(connectedUsers => {
        activeConnections.forEach(client => {
            if (client.connection.readyState === client.connection.OPEN) {
                client.connection.send(JSON.stringify({
                    type: 'newConnection',
                    connectedUsers: connectedUsers
                }));
            }
        });
    });

    // Quando o WebSocket receber uma mensagem
    connection.on('message', async (message) => {
        try {

            const messageData = JSON.parse(message.toString());

            if (messageData.type === 'private') {
                // Envia mensagem privada

                console.log("Mensagem recebida no server")
                // Busca o socketId do destinatário no Firestore
                const socketId = await getSocketIdByUsername(messageData.to);

                if (socketId) {
                    // Encontra o socket do destinatário
                    const receiverSocket = findSocketById(socketId, wsServer);
                    console.log(receiverSocket);
                    if (receiverSocket) {
                        console.log("Enviado para " + messageData.to)
                        // Envia a mensagem privada
                        receiverSocket.send(JSON.stringify({
                            type: 'private',
                            from: messageData.from,
                            to: messageData.to,
                            message: messageData.message,
                            timestamp: messageData.timestamp
                        }));

                        connection.send(JSON.stringify({
                            type: 'private',
                            from: messageData.from,
                            to: messageData.to,
                            message: messageData.message,
                            timestamp: messageData.timestamp
                        }));

                        console.log("Mensagem enviada para os destinatarios")
                    }
                }
            } else if (messageData.type === 'public') {

                // Broadcast para todos os clientes conectados mensagem publica
                activeConnections.forEach(client => {
                    if (client.connection.readyState === client.connection.OPEN) {
                        client.connection.send(JSON.stringify({
                            type: 'public',
                            from: messageData.from,
                            message: messageData.message,
                            timestamp: messageData.timestamp
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });
    connection.on('close', async () => {
        deleteDocFromConnection(userId);
    })
    activeConnections.push({ connection, username });
})

server.listen(port, () => {
    console.log(`WebSocket server is running on port: ${port}`)
})