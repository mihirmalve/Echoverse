import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Routes from './routes.js'; 
import connectDB from './database.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ACTIONS from './actions.js';
import { Server } from "socket.io";
import http from "http";
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5500;


// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ya apne frontend ka URL
    methods: ["GET", "POST"]
  }
});

app.use(cookieParser());
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000', 
  
};
app.use('/storage',express.static('storage'));
app.use(cors(corsOptions)); // Enable CORS for the specified origin
app.use(express.json({ limit: '50mb' }));

connectDB(); // Connect to MongoDB

app.use( Routes);
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Socket.io connection
const socketUserMap = {};

io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMap[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user,
            });
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMap[clientId],
            });
        });
        socket.join(roomId);
    });

    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });

    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                console.log('mute info');
                io.to(clientId).emit(ACTIONS.MUTE_INFO, {
                    userId,
                    isMute,
                });
            }
        });
    });

    const leaveRoom = () => {
        const { rooms } = socket;
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMap[socket.id]?.id,
                });

                // socket.emit(ACTIONS.REMOVE_PEER, {
                //     peerId: clientId,
                //     userId: socketUserMap[clientId]?.id,
                // });
            });
            socket.leave(roomId);
        });
        delete socketUserMap[socket.id];
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);

    socket.on('disconnecting', leaveRoom);
});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));    
