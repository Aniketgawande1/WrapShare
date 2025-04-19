// server/routes/files.js
const express = require('express');
const router = express.Router();
const { 
  uploadFile, 
  downloadFile, 
  deleteFile, 
  getFileInfo 
} = require('../controllers/fileController');
const { protect, admin } = require('../middleware/auth');

// File routes
router.post('/upload', protect, uploadFile);
router.get('/:fileId/download', protect, downloadFile);
router.delete('/:fileId', protect, deleteFile);
router.get('/:fileId', protect, getFileInfo);

module.exports = router;