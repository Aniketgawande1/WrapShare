// server/models/AuditLog.js
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'room_create',
      'room_join',
      'room_leave',
      'file_upload',
      'file_download',
      'file_delete',
      'user_register',
      'user_login',
      'user_logout'
    ]
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
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ room: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
