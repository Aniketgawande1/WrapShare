// server/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
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
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    maxFileSize: {
      type: Number,
      default: 100 * 1024 * 1024 // 100MB
    },
    allowedFileTypes: {
      type: [String],
      default: ['*'] // Allow all file types
    },
    maxFiles: {
      type: Number,
      default: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
RoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
