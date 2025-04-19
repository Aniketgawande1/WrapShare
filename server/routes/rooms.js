// server/routes/rooms.js
const express = require('express');
const router = express.Router();
const { 
  createRoom, 
  getRoomById, 
  getUserRooms, 
  updateRoom, 
  getRoomAuditLogs 
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/auth');

// Room routes
router.post('/', protect, createRoom);
router.get('/my-rooms', protect, getUserRooms);
router.get('/:roomId', protect, getRoomById);
router.put('/:roomId', protect, updateRoom);
router.get('/:roomId/audit-logs', protect, getRoomAuditLogs);

module.exports = router;