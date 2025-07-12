// client/src/components/UserList.jsx
import React from 'react';

export default function UserList({ users, currentUserId }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No users connected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user._id} className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {user.name || 'Anonymous'}
              {user._id === currentUserId && (
                <span className="ml-2 text-xs text-gray-500">(You)</span>
              )}
            </p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
