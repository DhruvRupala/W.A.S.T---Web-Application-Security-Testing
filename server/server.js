const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');
const adminRoutes = require('./routes/admin');
const pdfRoutes = require('./routes/pdf');

const app = express();
const server = http.createServer(app);

// CORS Configuration — set CORS_ORIGIN in production to your Vercel URL
// e.g., CORS_ORIGIN=https://wast-frontend.vercel.app
const allowedOrigin = process.env.CORS_ORIGIN || '*';

const io = new Server(server, {
  cors: { origin: allowedOrigin }
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Rate limiters for auth endpoints (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for testing (was 10)
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased for testing (was 5)
  message: { message: 'Too many registration attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiters temporarily disabled for local development/testing
// You can re-enable these for production
// app.use('/api/auth/login', loginLimiter);
// app.use('/api/auth/register', registerLimiter);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pdf', pdfRoutes);

// WebSocket connection
let activeConnections = 0;
io.on('connection', (socket) => {
  activeConnections++;
  io.emit('active_users', activeConnections);
  console.log('Client connected:', socket.id, '| Active:', activeConnections);

  socket.on('disconnect', () => {
    activeConnections = Math.max(0, activeConnections - 1);
    io.emit('active_users', activeConnections);
    console.log('Client disconnected:', socket.id, '| Active:', activeConnections);
  });
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
