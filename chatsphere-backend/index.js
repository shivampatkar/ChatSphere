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

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ─── Express middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ChatSphere backend running' });
});


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


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
