// client/src/pages/Room.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import UserList from '../components/UserList';
import { useAuth } from '../context/AuthContext';

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    // Connect to the Socket.IO server
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      query: { roomId, userId: user._id }
    });

    // Get initial room data
    fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`)
      .then(res => res.json())
      .then(data => {
        setRoom(data);
        setFiles(data.files);
      })
      .catch(err => toast.error('Failed to load room data'));

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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  if (!room) {
    return <div className="flex h-screen justify-center items-center">Loading room...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white px-6 py-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Room: {room.name || roomId}</h1>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <button 
              onClick={generateShareLink}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              Share Link
            </button>
            <button 
              onClick={() => setShowQRCode(!showQRCode)}
              className="bg-transparent border border-white text-white px-4 py-2 rounded hover:bg-white/10"
            >
              {showQRCode ? 'Hide QR' : 'Show QR'}
            </button>
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