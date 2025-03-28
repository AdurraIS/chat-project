const http = require('http')
const { WebSocketServer } = require('ws')
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, updateDoc, deleteDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCl94czceWcCF6NGeFFgSSLIrrBWK91oOs",
    authDomain: "chat-project-e2537.firebaseapp.com",
    projectId: "chat-project-e2537",
    storageBucket: "chat-project-e2537.firebasestorage.app",
    messagingSenderId: "660289624896",
    appId: "1:660289624896:web:efc3291219dc363e48f8a5",
    measurementId: "G-MVKK1T4K49"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const url = require(`url`);
const { parse } = require('path');

const port = 8000;

const server = http.createServer()
const wsServer = new WebSocketServer({ server })

let messagesList = []
let activeConnections = []

wsServer.on(`connection`, (connection, request) => {
    const userId = 'user' + Date.now();
    const socketId = connection._socket.remoteAddress + Date.now();
    const {username} = url.parse(request.url, true).query;

    const connectionRef = doc(db, 'connections', userId);
    setDoc(connectionRef, {
        socketId,
        username,
        status: 'online',
        timestamp: Timestamp.now(),
    });

    // Quando o WebSocket receber uma mensagem
    connection.on('message', async (message) => {
        console.log('Mensagem recebida:', message);

        // Suponhamos que a mensagem tenha o formato: { receiverId, text }
        const { receiverId, text } = JSON.parse(message);

        // Enviar a mensagem para o destinatário com base no receiverId
        const receiverSocketId = await getSocketIdByUserId(receiverId);

        if (receiverSocketId) {
            // Encontrar o WebSocket do destinatário
            const receiverSocket = findSocketById(receiverSocketId);
            if (receiverSocket) {
                // Enviar a mensagem ao destinatário
                receiverSocket.send(JSON.stringify({ senderId: userId, text }));
            } else {
                console.log('Destinatário não conectado');
            }
        } else {
            console.log('Usuário destinatário não encontrado');
        }
    });
    connection.on('close', async () => {
        await deleteDoc(doc(db, 'connections', userId));
    })
    activeConnections.push({ connection, username });
})

server.listen(port, () => {
    console.log(`WebSocket server is running on port: ${port}`)
})

const getSocketIdByUserId = async (userId) => {
    const connectionRef = doc(db, 'connections', userId);
    const docSnap = await getDoc(connectionRef);
    
    if (docSnap.exists()) {
      return docSnap.data().socketId;
    } else {
      console.log('Usuário não encontrado');
      return null;
    }
  };

const findSocketById = (socketId) => {
    for (let client of wss.clients) {
      if (client._socket.remoteAddress + client._socket.localPort === socketId) {
        return client;
      }
    }
    return null;
  };
  