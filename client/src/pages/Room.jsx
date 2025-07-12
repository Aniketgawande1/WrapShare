// client/src/pages/Room.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import FileUploader from '../components/Fileuploader';
import FileList from '../components/FileList';
import UserList from '../components/UserList';
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      // No need to remove from files array as socket will handle it
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
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
    return (
      <ErrorPage 
        title="Error loading room"
        message={error}
        onRetry={() => window.location.reload()}
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
        {showQRCode && (
          <div className="mb-8 flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Room QR Code</h2>
            <QRCode value={`${window.location.origin}/rooms/${roomId}`} size={200} />
            <p className="mt-4 text-gray-600">Scan to join this room</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              <FileUploader onUpload={handleFileUpload} />
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Shared Files</h2>
              <FileList 
                files={files} 
                onDelete={handleDeleteFile} 
                isAdmin={user.role === 'admin'}
                userId={user._id}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Connected Users ({users.length})</h2>
              <UserList users={users} currentUserId={user._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}