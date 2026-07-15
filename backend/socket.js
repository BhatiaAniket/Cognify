/**
 * Socket.io Server
 * Handles real-time notifications, chat messaging, and WebRTC signaling for meetings.
 */
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisClient } = require('./config/redis');
const jwt = require('jsonwebtoken');

let io;

// ──────────────────────────────────────────────
// Track meeting rooms: roomId -> Map(socketId -> { userId, userName })
// ──────────────────────────────────────────────
const rooms = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connect Redis adapter if Redis is running
  if (redisClient && redisClient.isReady) {
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✓ Redis Adapter for Socket.io linked');
    });
  }

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.companyId = decoded.companyId;
      socket.fullName = decoded.fullName;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (${socket.fullName})`);

    // Join personal and company rooms for push notifications
    socket.join(`user_${socket.userId}`);
    if (socket.companyId) socket.join(`company:${socket.companyId}`);

    // ──────────────────────────────────────────────
    // MEETING SIGNALING — Complete rewrite
    // ──────────────────────────────────────────────

    function handleLeave(sock, roomId) {
      if (!rooms.has(roomId)) return;
      rooms.get(roomId).delete(sock.id);
      
      const roomSize = rooms.get(roomId).size;
      if (roomSize === 0) {
        rooms.delete(roomId);
      } else {
        // Notify remaining participants
        sock.to(roomId).emit('participant-left', { socketId: sock.id });
        io.to(roomId).emit('participant-count', roomSize);
      }
      sock.leave(roomId);
      console.log(`👋 ${sock.fullName} left room ${roomId}. Remaining: ${roomSize}`);
    }

    // JOIN ROOM
    socket.on('join-room', ({ roomId, userId, userName }) => {
      if (!roomId) return;
      
      socket.join(roomId);
      socket.currentRoomId = roomId;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      rooms.get(roomId).set(socket.id, {
        userId: userId || socket.userId,
        userName: userName || socket.fullName || 'Participant'
      });

      console.log(`🚪 ${userName || socket.fullName} joined room: ${roomId}. Total: ${rooms.get(roomId).size}`);

      // 1. Send list of already-present participants to the newcomer
      const existingParticipants = [];
      rooms.get(roomId).forEach((data, sockId) => {
        if (sockId !== socket.id) {
          existingParticipants.push({ socketId: sockId, ...data });
        }
      });
      socket.emit('existing-participants', existingParticipants);

      // 2. Notify everyone else
      socket.to(roomId).emit('participant-joined', {
        socketId: socket.id,
        userId: userId || socket.userId,
        userName: userName || socket.fullName || 'Participant'
      });

      // 3. Broadcast updated count to everyone in the room
      io.to(roomId).emit('participant-count', rooms.get(roomId).size);
    });

    // WEBRTC SIGNALING — forward to specific peer only
    socket.on('offer', ({ targetSocketId, offer }) => {
      if (!targetSocketId || !offer) return;
      console.log(`📨 offer: ${socket.id} -> ${targetSocketId}`);
      socket.to(targetSocketId).emit('offer', {
        fromSocketId: socket.id,
        offer
      });
    });

    socket.on('answer', ({ targetSocketId, answer }) => {
      if (!targetSocketId || !answer) return;
      console.log(`📨 answer: ${socket.id} -> ${targetSocketId}`);
      socket.to(targetSocketId).emit('answer', {
        fromSocketId: socket.id,
        answer
      });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      if (!targetSocketId || !candidate) return;
      socket.to(targetSocketId).emit('ice-candidate', {
        fromSocketId: socket.id,
        candidate
      });
    });

    // IN-MEETING CHAT
    socket.on('meeting-chat', async ({ roomId, message, userName }) => {
      if (!roomId || !message) return;
      const payload = {
        fromSocketId: socket.id,
        userName: userName || socket.fullName || 'Participant',
        message,
        timestamp: new Date().toISOString()
      };
      io.to(roomId).emit('meeting-chat', payload);

      // Persist chat to DB
      try {
        const Meeting = require('./models/Meeting');
        await Meeting.findOneAndUpdate(
          { $or: [{ roomId }, { _id: roomId }] },
          {
            $push: {
              chatHistory: {
                userId: socket.userId,
                userName: userName || socket.fullName,
                message,
                timestamp: new Date()
              }
            }
          }
        );
      } catch (err) {
        console.error('Chat save error:', err.message);
      }
    });

    // MEDIA STATE CHANGE (mic/cam on-off)
    socket.on('media-state', ({ roomId, type, enabled }) => {
      if (!roomId) return;
      socket.to(roomId).emit('media-state-changed', {
        fromSocketId: socket.id,
        type,
        enabled
      });
    });

    // END MEETING (host ends for everyone)
    socket.on('end-meeting', ({ roomId }) => {
      if (!roomId) return;
      console.log(`🔴 Meeting ended by host in room: ${roomId}`);
      io.to(roomId).emit('meeting-ended');
      rooms.delete(roomId);
    });

    // LEAVE ROOM (user voluntarily leaves)
    socket.on('leave-room', ({ roomId }) => {
      handleLeave(socket, roomId);
    });

    // DISCONNECT (browser closed, network dropped, etc.)
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      if (socket.currentRoomId) {
        handleLeave(socket, socket.currentRoomId);
      }
      // Also scan all rooms as a safety net
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          handleLeave(socket, roomId);
        }
      });
    });

    // ──────────────────────────────────────────────
    // STANDARD NOTIFICATIONS & CHAT
    // ──────────────────────────────────────────────
    socket.on('chat:join', (conversationId) => socket.join(`chat:${conversationId}`));
    socket.on('chat:leave', (conversationId) => socket.leave(`chat:${conversationId}`));

    // Forward typing indicators to the conversation room
    socket.on('chat:typing', ({ conversationId, userName }) => {
      if (conversationId) {
        socket.to(`chat:${conversationId}`).emit('chat:typing', {
          userName: userName || socket.fullName || 'Someone',
        });
      }
    });
    socket.on('chat:stopTyping', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`chat:${conversationId}`).emit('chat:stopTyping');
      }
    });

    // Summary shared notification (for client real-time alert)
    socket.on('summary-shared', (data) => {
      if (data.clientId) {
        io.to(`user_${data.clientId}`).emit('summary-shared', data);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) io.to(`user_${userId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser };
