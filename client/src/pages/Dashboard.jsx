// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserRooms();
  }, []);

  const fetchUserRooms = async () => {
    try {
      const response = await roomService.getUserRooms();
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await roomService.createRoom(newRoomName);
      setRooms([response.data, ...rooms]);
      setNewRoomName('');
      setShowCreateRoom(false);
      toast.success('Room created successfully!');
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/rooms/${joinRoomId.trim()}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FileHub Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
            {showCreateRoom ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setNewRoomName('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Create Room
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Join Existing Room</h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                required
              />
              <button
                type="submit"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>

        {/* My Rooms */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">My Rooms</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-8-2v2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2" />
                </svg>
                <p className="mt-2">No rooms yet</p>
                <p className="text-sm">Create your first room to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {room.name || `Room ${room._id.slice(-6)}`}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {room.files?.length || 0} files
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Created {formatDate(room.createdAt)}
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        to={`/rooms/${room.roomId}`}
                        className="flex-1 bg-black text-white px-3 py-2 rounded-md text-sm text-center hover:bg-gray-800"
                      >
                        Enter Room
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.roomId}`);
                          toast.success('Room link copied!');
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-300"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
