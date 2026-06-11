import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import authRoutes from './features/auth/auth.routes.js';
import messageRoutes from './features/messages/message.routes.js';
import { saveMessage } from './features/messages/message.repository.js';

/*
  App + Server setup
  ------------------
  We wrap express in a raw http server because socket.io needs
  to attach to the http server directly, not to the express app.
  Both REST and WebSocket traffic go through the same port this way.
*/
const app = express();
const server = createServer(app);

/*
  Socket.io setup
  ---------------
  cors origin * means any client can connect.
  In production you would lock this down to your app's domain.
*/
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Express middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── REST Routes ────────────────────────────────────────────────
/*
  /auth     → register and login (public)
  /messages → fetch chat history (protected by authMiddleware inside)
*/
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ChatSphere backend running' });
});

// ─── Socket.io JWT guard ────────────────────────────────────────
/*
  io.use runs before every socket connection is accepted.
  The mobile app sends the JWT in socket.handshake.auth.token
  (set when calling io('URL', { auth: { token } }) on the client).

  If token is missing or invalid → connection is rejected with an error.
  The mobile app receives this error in the connect_error event and
  can handle it (e.g. redirect to login).

  If token is valid → socket.user is attached so every event handler
  inside io.on('connection') knows who this socket belongs to.
*/
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized: no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Unauthorized: invalid token'));
  }
});

// ─── Socket.io connection handler ──────────────────────────────
/*
  Each connected client gets its own socket object.
  socket.user is the decoded JWT payload: { id, username }

  Events we listen for:

  send_message
    Emitted by the mobile app when the user hits send.
    Payload: { text }

    Flow:
      1. Validate text is not empty
      2. Save message to MongoDB (so it persists)
      3. Build a payload with all fields the mobile app needs
      4. io.emit broadcasts to ALL connected clients including the sender
         (the mobile app uses senderId vs current user id to decide
          whether to render the bubble on the left or right)

  disconnect
    Fires automatically when the socket closes (app backgrounded,
    logout, network drop). We just log it here.
    The mobile app handles reconnection via socket.io-client's
    built-in reconnection logic.
*/
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  socket.on('send_message', async (data) => {
    try {
      const { text } = data;

      if (!text || !text.trim()) return;

      const saved = await saveMessage({
        senderId: socket.user.id,
        senderName: socket.user.username,
        text: text.trim(),
      });

      const payload = {
        _id: saved._id,
        senderId: socket.user.id,
        senderName: socket.user.username,
        text: saved.text,
        createdAt: saved.createdAt,
      };

      io.emit('new_message', payload);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

// ─── Start server ───────────────────────────────────────────────
/*
  connectDB first → only start listening once DB is ready.
  If MongoDB fails, process.exit(1) inside connectDB stops everything.
*/
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
