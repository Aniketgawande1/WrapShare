// client/src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  title = 'FileDrop', 
  showBack = false, 
  backTo = '/dashboard',
  actions = []
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleBack = () => {
    navigate(backTo);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button and title */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            )}
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>

          {/* Center - Custom actions */}
          <div className="hidden md:flex items-center space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${action.className || 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-sm">
                <span className="text-gray-300">Welcome, </span>
                <span className="font-medium text-white">{user?.name}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile actions */}
        {actions.length > 0 && (
          <div className="md:hidden pb-3 space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${action.className || 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
