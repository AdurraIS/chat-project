const http = require('http')
const { WebSocketServer } = require('ws')
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, updateDoc, deleteDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
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
  