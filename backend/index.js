const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Adjust this to match your client origin
  methods: ["GET", "POST"],
  credentials: true, // Allow credentials (like cookies or authorization headers)
};

// Use CORS middleware for Express routes
app.use(cors(corsOptions));

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://sankalpt098:9pAsB9QL5Cumr7Mf@gapparoom.yn2sp.mongodb.net/?retryWrites=true&w=majority&appName=GappaRoom",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust this to match your client origin
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials
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
