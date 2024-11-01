const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
app.use(express.json());
const port = 3000;


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Room Schema
const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  members: [{ nickname: String, joinedAt: { type: Date, default: Date.now } }],
  statuses: [
    {
      nickname: String,
      status: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

// Set up HTTP server and Socket.IO
const server = http.createServer(app);
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
  })
);

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  },
});

function generateRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz"; // Limited to lowercase letters
  const segment = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `${segment()}-${segment()}-${segment()}`;
}

// Basic endpoint
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", async ({ roomId, nickname }) => {
    console.log(`User ${nickname} is attempting to join room ${roomId}`);

    const room = await Room.findOne({ roomId });
    if (room) {
      const isMember = room.members.some(
        (member) => member.nickname === nickname
      );

      // Join the room first
      socket.join(roomId);

      if (isMember) {
        // User is already a member, just rejoin
        socket.emit("roomJoined", { roomId });
        socket.emit("receiveMessage", {
          nickname: "Server",
          message: "Welcome back to the chat!",
        });
        console.log(`${nickname} rejoined ${roomId}`);
      } else {
        // User is not a member; add them
        room.members.push({ nickname });
        await room.save();

        socket.emit("roomJoined", { roomId });
        socket.emit("receiveMessage", {
          nickname: "Server",
          message: "Welcome to the chat!",
        });

        console.log(`${nickname} joined ${roomId}`);
      }

      io.to(roomId).emit("notification", {
        type: "join",
        message: `${nickname} joined the chat`,
      });

      // Optionally emit the updated room data
      io.to(roomId).emit("roomData", {
        room: room.name,
        members: room.members,
      });
    } else {
      socket.emit("roomError", {
        message: "Room does not exist.",
      });
    }
  });

  // Create Room Logic
  socket.on("createRoom", async ({ roomName, nickname }) => {
    let roomId;
    let existingRoom;

    do {
      roomId = generateRoomId();
      existingRoom = await Room.findOne({ roomId });
    } while (existingRoom);

    const newRoom = new Room({
      roomId,
      name: roomName,
      members: [{ nickname }],
    });
    await newRoom.save();

    socket.join(roomId);
    socket.emit("roomCreated", { roomId });

    io.to(roomId).emit("roomData", {
      room: roomName,
      members: newRoom.members,
    });

    console.log(`${nickname} created and joined ${roomId}`);
  });

  // Send Message Logic
  socket.on("sendMessage", ({ roomId, nickname, message }) => {
    io.to(roomId).emit("receiveMessage", {
      nickname,
      message,
    });

    console.log(`Message from ${nickname} in ${roomId}: ${message}`);
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
