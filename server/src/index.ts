import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { store } from "./data/store";
import { registerSocketHandlers } from "./socket/handlers";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());

// REST endpoints
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/branches", (_req, res) => {
  res.json(store.getBranches());
});

app.get("/api/branches/:id", (req, res) => {
  const branch = store.getBranch(req.params.id);
  if (!branch) return res.status(404).json({ error: "Branch not found" });
  res.json(branch);
});

app.get("/api/feedbacks", (_req, res) => {
  res.json(store.getFeedbacks());
});

// Socket.IO
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.emit("initial:data", {
    branches: store.getBranches(),
    feedbacks: store.getFeedbacks(),
  });

  registerSocketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Periodic heartbeat every 30s to keep state fresh
setInterval(() => {
  io.emit("heartbeat", { timestamp: new Date().toISOString() });
}, 30000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🔴 DOOKKI Live Board Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🌐 API: http://localhost:${PORT}/api\n`);
});
