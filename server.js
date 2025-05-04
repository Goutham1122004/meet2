const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const path = require("path");

// PeerJS Server
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use(express.static(path.join(__dirname, "../build"))); // Adjusted path
app.use("/peerjs", peerServer);

// API endpoint to create a new room
app.get("/api/create-room", (req, res) => {
    const roomId = uuidv4();
    res.json({ roomId });
});

// Socket.io handling
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId, userName);

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (userName) => {
            socket.to(roomId).emit("AddName", userName);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

// Serve React frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html")); // Adjusted path
});

// Start server
const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Required for Vercel deployment
