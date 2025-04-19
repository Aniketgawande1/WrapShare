// server/controllers/fileController.js
const File = require('../models/File');
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const socketHandler = require('../socket/socketHandler');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// File upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Optional: Add file type restrictions here
    cb(null, true);
  }
}).single('file');

// Upload file
exports.uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { roomId } = req.body;
      
      // Validate room
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Create file record
      const newFile = new File({
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        path: req.file.path,
        uploadedBy: req.user._id,
        room: room._id
      });

      await newFile.save();
      
      // Add file to room
      room.files.push(newFile._id);
      await room.save();
      
      // Create audit log
      await AuditLog.create({
        action: 'upload',
        user: req.user._id,
        room: room._id,
        file: newFile._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      // Populate user info for socket
      const fileWithUser = await File.findById(newFile._id).populate('uploadedBy', 'name email');
      
      // Notify all room members about the new file
      socketHandler().notifyFileUpload(roomId, fileWithUser);
      
      res.status(201).json({ 
        message: 'File uploaded successfully',
        file: fileWithUser
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      action: 'download',
      user: req.user._id,
      room: file.room,
      file: file._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.download(file.path, file.name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    const file = await File.findById(fileId).populate('room uploadedBy');
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check permission (only file uploader or admin can delete)
    const isAdmin = req.user.role === 'admin';
    const isUploader = file.uploadedBy._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isUploader) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Delete file from filesystem
    fs.unlinkSync(file.path);
    
    // Remove file from room
    await Room.findByIdAndUpdate(file.room._id, {
      $pull: { files: file._id }
    });
    
    // Create audit log
    await AuditLog.create({
      action: 'delete',
      user: req.user._id,
      room: file.room._id,
      file: file._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Delete file from database
    await file.remove();
    
    // Notify room members
    socketHandler().notifyFileDelete(file.room.roomId, fileId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file info
exports.getFileInfo = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    const file = await File.findById(fileId)
      .populate('uploadedBy', 'name email')
      .populate('room', 'roomId name');
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.json(file);
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};