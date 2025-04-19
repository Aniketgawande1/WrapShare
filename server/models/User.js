// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

// server/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Room expires after 7 days (in seconds)
  }
});

module.exports = mongoose.model('Room', RoomSchema);

// server/models/File.js
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      // By default, files expire after 7 days
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Files automatically expire based on expiresAt field
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', FileSchema);

// server/models/AuditLog.js
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['upload', 'download', 'delete', 'room_create', 'room_join'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);