//imports
const express = require("express");
const http = require("http");
const cors = require('cors')
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const env = require('dotenv').config()
const app = express();
const connection = require('./config/db.js')
const limiter = require('./middlewares/ratelimit')
const authrouter = require('./routes/authroute.js')
const profilerouter = require('./routes/profilerouter.js')
const musicnoterouter = require('./routes/musicnoterouter.js')
const port = 3000;

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "https://tune-talent.vercel.app"],
    credentials: true
}))
app.use(limiter)

//routes
app.use("/auth",authrouter)
app.use("/profile",profilerouter)
app.use("/music",musicnoterouter)

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://tune-talent.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// In-memory room state (simple — no DB persistence)
const rooms = {};

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a collab room
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;

        // Initialize room state if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = {
                steps: {
                    kick: Array(16).fill(false),
                    snare: Array(16).fill(false),
                    hat: Array(16).fill(false),
                    bass: Array(16).fill(false),
                    synth: Array(16).fill(false),
                    pad: Array(16).fill(false),
                },
                bpm: 120,
                playing: false,
            };
        }

        // Send current room state to the joining user
        socket.emit("room-state", rooms[roomId]);

        // Notify everyone in the room about user count
        const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit("user-count", count);

        console.log(`Socket ${socket.id} joined room ${roomId} (${count} users)`);
    });

    // Receive step update from a user and broadcast to room
    socket.on("step-update", (steps) => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            rooms[roomId].steps = steps;
            socket.to(roomId).emit("step-update", steps);
        }
    });

    // Receive BPM update from a user and broadcast to room
    socket.on("bpm-update", (bpm) => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            rooms[roomId].bpm = bpm;
            socket.to(roomId).emit("bpm-update", bpm);
        }
    });

    // Receive play toggle from a user and broadcast to room
    socket.on("play-toggle", (isPlaying) => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            rooms[roomId].playing = isPlaying;
            socket.to(roomId).emit("play-toggle", isPlaying);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (roomId) {
            const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
            io.to(roomId).emit("user-count", count);

            // Clean up empty rooms
            if (count === 0) {
                delete rooms[roomId];
            }
        }
        console.log("Socket disconnected:", socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connection()
});