// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/update-profile', userData)
};

// Room services
export const roomService = {
  createRoom: (name) => api.post('/api/rooms', { name }),
  getRoom: (roomId) => api.get(`/api/rooms/${roomId}`),
  getUserRooms: () => api.get('/api/rooms/my-rooms'),
  updateRoom: (roomId, data) => api.put(`/api/rooms/${roomId}`, data),
  getRoomAuditLogs: (roomId) => api.get(`/api/rooms/${roomId}/audit-logs`)
};

// File services
export const fileService = {
  uploadFile: (file, roomId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    return axios.post(`${API_URL}/api/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Can be used to update a progress state
        return percentCompleted;
      }
    });
  },
  deleteFile: (fileId) => api.delete(`/api/files/${fileId}`),
  getFileInfo: (fileId) => api.get(`/api/files/${fileId}`),
  getDownloadUrl: (fileId) => `${API_URL}/api/files/${fileId}/download`
};

export default api;