require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, where, setDoc, query, deleteDoc, Timestamp, collection, getDocs } = require('firebase/firestore');

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



// Busca todos os usuários conectados no Firestore
const getConnectedUsers = async () => {
    const connectionsRef = collection(db, 'connections');
    const querySnapshot = await getDocs(connectionsRef);
    const connectedUsers = [];
    querySnapshot.forEach((doc) => {
        connectedUsers.push({
            userId: doc.data.socketId,
            username: doc.data().username,
            status: doc.data().status
        });
    });
    return connectedUsers;
};

const getSocketIdByUsername = async (username) => {
    try {
        // Consulta a coleção de conexões procurando pelo username
        const connectionsRef = collection(db, 'connections');
        const q = query(connectionsRef, where('username', '==', username));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Como a consulta é única, pegamos o primeiro resultado
            return docSnap.data().socketId;
        } else {
            console.log('Usuário não encontrado');
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar Socket by Username:', error);
        return null;
    }
};


const findSocketById = (socketId) => {
    for (let client of wsServer.clients) {
        if (client._socket.remoteAddress + client._socket.localPort === socketId) {
            return client;
        }
    }
    return null;
};
const deleteDocFromConnection = async (userId) => {
    await deleteDoc(doc(db, 'connections', userId));
}
const persistConnection = (userId, socketId) =>{
    const connectionRef = doc(db, 'connections', userId);
    setDoc(connectionRef, {
        socketId,
        username,
        status: 'online',
        timestamp: Timestamp.now(),
    });
}

module.exports = {
    getConnectedUsers,
    getSocketIdByUsername,
    findSocketById,
    deleteDocFromConnection,
    persistConnection,
};