// server/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

module.exports = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected`);

    // Join a room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        socket.join(roomId);
        socket.roomId = roomId;
        
        // Add user to room members if not already added
        if (!room.members.includes(socket.user._id)) {
          room.members.push(socket.user._id);
          await room.save();
        }

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', {
          _id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        });

        // Send current room users list
        const roomUsers = await User.find({ 
          _id: { $in: room.members } 
        }).select('name email');
        
        socket.emit('users-list', roomUsers);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle file upload notifications
    socket.on('file-uploaded', (fileData) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('file-uploaded', fileData);
      }
    });

    // Handle file deletion notifications
    socket.on('file-deleted', (fileId) => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('file-deleted', fileId);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', socket.user._id);
      }
    });
  });
};

// Import socket handler
const socketHandler = require('./socket/socketHandler');

// Config
dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
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

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Socket handler
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));