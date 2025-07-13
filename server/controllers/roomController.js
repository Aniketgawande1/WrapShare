// server/controllers/roomController.js
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Generate a unique room ID
    const roomId = uuidv4().substring(0, 8);
    
    const newRoom = new Room({
      name: name || `Room-${roomId}`,
      roomId,
      createdBy: req.user._id,
      members: [req.user._id]
    });
    
    await newRoom.save();
    
    // Create audit log
    await AuditLog.create({
      action: 'room_create',
      user: req.user._id,
      room: newRoom._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('Getting room by ID:', roomId);
    console.log('User requesting room:', req.user._id);
    
    // Basic validation for room ID
    if (!roomId || roomId.length < 3 || roomId === 'room') {
      console.log('Invalid room ID provided:', roomId);
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    const room = await Room.findOne({ roomId })
      .populate('createdBy', 'name email')
      .populate({
        path: 'files',
        populate: {
          path: 'uploadedBy',
          select: 'name email'
        },
        options: { sort: { createdAt: -1 } }
      });
    
    console.log('Room found:', room ? 'Yes' : 'No');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Add user to room members if not already there
    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
      
      // Create audit log
      await AuditLog.create({
        action: 'room_join',
        user: req.user._id,
        room: room._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    console.log('Sending room data:', { roomId: room.roomId, name: room.name });
    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's rooms
exports.getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .select('name roomId createdAt')
      .sort({ createdAt: -1 });
    
    res.json(rooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is the creator of the room
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    room.name = name;
    await room.save();
    
    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get room audit logs
exports.getRoomAuditLogs = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if user is admin or room creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = room.createdBy.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    const logs = await AuditLog.find({ room: room._id })
      .populate('user', 'name email')
      .populate('file', 'name size')
      .sort({ createdAt: -1 });
    
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};