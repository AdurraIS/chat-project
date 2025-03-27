const http = require('http')
const { WebSocketServer } = require('ws')

const url = require(`url`)

const port = 8000;

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

let messagesList = []
let activeConnections = []

wsServer.on(`connection`, (connection, request)=>{
    const {username} = url.parse(request.url, true).query
    const {birthdate} = url.parse(request.url, true).query

    console.log(`Username ${username} birthday is on ${birthdate}`)
    
    // Adiciona a nova conexão à lista de conexões ativas
    activeConnections.push(connection)

    connection.on(`sendMessage`, message => {
        messagesList.push({
            message: message.message,
            username: username
        });
        
        // Broadcast para todos os clientes conectados
        activeConnections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messagesList))
            }
        })
    })

    // Remove a conexão quando o cliente desconecta
    connection.on('close', () => {
        activeConnections = activeConnections.filter(conn => conn !== connection)
    })
})

server.listen(port, () => {
    console.log(`WebSocket server is running on port: ${port}`)
})

