import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const userSockets = new Map(); // userId -> Set of socketIds

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authenticate socket handshake using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded; // Contains id, email, role
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected via socket: ${userId} (${socket.user.role})`);

    // Map user to socket ID
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user to their own personal room
    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected socket: ${socket.id}`);
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Send real-time notification to a specific user
 * @param {string} userId Destination user ID
 * @param {object} notification Notification payload
 */
export const notifyUser = (userId, notification) => {
  if (io) {
    io.to(userId).emit('notification', notification);
  }
};

/**
 * Broadcast real-time notifications to all users
 * @param {object} notification Notification payload
 */
export const broadcastNotification = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};
