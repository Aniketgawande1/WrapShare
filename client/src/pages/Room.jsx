// client/src/pages/Room.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import FileUploader from '../components/Fileuploader';
import FileManager from '../components/FileManager';
import UserList from '../components/UserList';
import RoomChat from '../components/RoomChat';
import ActivityFeed from '../components/ActivityFeed';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorPage from '../components/ErrorPage';
import { useAuth } from '../context/AuthContext';

export default function Room() {
  const { roomId } = useParams();
  const { user, getToken } = useAuth();
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();

  console.log('Room component rendering:', { roomId, user });

  useEffect(() => {
    if (!user) {
      console.log('No user found, returning early');
      return;
    }

    // Validate roomId format (basic validation)
    if (!roomId || roomId.length < 3 || roomId === 'room') {
      console.log('Invalid room ID:', roomId);
      setError('Invalid room ID');
      setLoading(false);
      return;
    }

    console.log('Fetching room data for:', roomId);
    
    // Get initial room data
    const token = getToken();
    if (!token) {
      console.log('No token available for room fetch');
      setError('Authentication required');
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('Room API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Room data received:', data);
        setRoom(data);
        setFiles(data.files || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load room data:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load room data');
      });

    // Connect to the Socket.IO server
    const socketToken = getToken();
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: socketToken
      },
      query: { roomId, userId: user._id }
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to room');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from room');
    });

    socketRef.current.on('user-joined', (newUser) => {
      setUsers(prev => [...prev, newUser]);
      toast.info(`${newUser.name} joined the room`);
    });

    socketRef.current.on('user-left', (userId) => {
      setUsers(prev => prev.filter(user => user._id !== userId));
      toast.info(`A user left the room`);
    });

    socketRef.current.on('file-uploaded', (file) => {
      setFiles(prev => [file, ...prev]);
      toast.success(`New file shared: ${file.name}`);
    });

    socketRef.current.on('file-deleted', (fileId) => {
      setFiles(prev => prev.filter(file => file._id !== fileId));
      toast.info('A file was deleted');
    });

    socketRef.current.on('users-list', (usersList) => {
      setUsers(usersList);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, user._id]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required for file upload');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      toast.success('File uploaded successfully');
      
      // No need to add to files array as socket will handle it
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required for file deletion');
        return;
      }

      console.log('Attempting to delete file:', fileId);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete failed with response:', errorData);
        
        if (response.status === 403) {
          toast.error('You do not have permission to delete this file');
        } else if (response.status === 404) {
          toast.error('File not found');
        } else {
          toast.error(`Delete failed: ${response.status}`);
        }
        return;
      }
      
      const result = await response.json();
      console.log('Delete successful:', result);
      
      // No need to remove from files array as socket will handle it
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete file: ${error.message}`);
    }
  };

  const generateShareLink = () => {
    const url = `${window.location.origin}/rooms/${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied to clipboard');
  };

  if (loading) {
    return <LoadingSpinner message="Loading room..." />;
  }

  if (error) {
    const isInvalidRoomId = error === 'Invalid room ID' || roomId === 'room';
    return (
      <ErrorPage 
        title={isInvalidRoomId ? "Invalid Room ID" : "Error loading room"}
        message={isInvalidRoomId ? 
          "The room ID you're trying to access is invalid. Please check the link or create a new room." : 
          error
        }
        onRetry={isInvalidRoomId ? () => window.location.href = '/dashboard' : () => window.location.reload()}
        showRetry={true}
      />
    );
  }

  if (!room) {
    return (
      <ErrorPage 
        title="Room not found"
        message="The room you're looking for doesn't exist or you don't have access to it."
        showRetry={false}
      />
    );
  }

  // Define navbar actions
  const navbarActions = [
    {
      label: 'Share Link',
      onClick: generateShareLink,
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      label: showQRCode ? 'Hide QR' : 'Show QR',
      onClick: () => setShowQRCode(!showQRCode),
      className: 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        title={`Room: ${room.name || roomId}`}
        showBack={true}
        backTo="/dashboard"
        actions={navbarActions}
      />
      
      {/* Connection Status */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? 's' : ''} online
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {room.name || `Room ${roomId}`}! 🎉
              </h1>
              <p className="text-gray-600 mb-4">
                Share files instantly with anyone in this room. All uploads are secure and accessible to room members.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Collaborate Easily</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                  <div className="text-sm text-gray-500">Files Shared</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-gray-900">Quick Actions:</h3>
              <button
                onClick={generateShareLink}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Copy Room Link
              </button>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
            </div>
          </div>
        </div>
        {showQRCode && (
          <div className="mb-8 flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Room QR Code</h2>
            <QRCode value={`${window.location.origin}/rooms/${roomId}`} size={200} />
            <p className="mt-4 text-gray-600">Scan to join this room</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* File Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">📁 Upload Files</h2>
                <div className="text-sm text-gray-500">
                  Max: 50MB per file
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <FileUploader onUpload={handleFileUpload} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All file types supported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Drag & drop supported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Instant sharing</span>
                </div>
              </div>
            </div>
            
            {/* Shared Files Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">📄 Shared Files</h2>
                {files.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {files.length} file{files.length !== 1 ? 's' : ''} shared
                  </div>
                )}
              </div>
              
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files shared yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Be the first to share a file! Upload documents, images, videos, or any file type to start collaborating.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="font-medium text-blue-900">📄 Documents</div>
                      <div className="text-blue-700">PDF, DOC, TXT</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="font-medium text-green-900">🖼️ Images</div>
                      <div className="text-green-700">JPG, PNG, GIF</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="font-medium text-purple-900">🎵 Media</div>
                      <div className="text-purple-700">MP3, MP4, ZIP</div>
                    </div>
                  </div>
                </div>
              ) : (
                <FileManager 
                  files={files} 
                  onDelete={handleDeleteFile} 
                  isAdmin={user.role === 'admin'}
                  userId={user._id}
                />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Connected Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">👥 Online Users</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-600">{users.length}</span>
                </div>
              </div>
              
              {users.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Waiting for others to join...</p>
                </div>
              ) : (
                <>
                  <UserList users={users} currentUserId={user._id} />
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      Share the room link to invite more collaborators
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Room Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ID:</span>
                  <span className="font-mono text-gray-900">{roomId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Files:</span>
                  <span className="text-gray-900">{files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <ActivityFeed roomId={roomId} />

            {/* Help & Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Drag and drop files directly to upload</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Share the room link to invite others</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Files sync in real-time for all users</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use QR code for quick mobile sharing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Chat */}
        <RoomChat socket={socketRef.current} roomId={roomId} />
      </div>
    </div>
  );
}