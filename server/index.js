// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const fileRoutes = require('./routes/files');

// Import socket handler
const socketHandler = require('./socket/socketHandler');

// Config
dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
const corsOptions = {
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/files', fileRoutes);

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  allowEIO3: true
});

// Socket handler
socketHandler(io);

// Make io instance globally available
global.io = io;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));