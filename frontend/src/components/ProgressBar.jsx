import React from 'react';

const ProgressBar = ({ progress, status, fileName }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);
  
  return (
    <div className="mb-4">
      {fileName && (
        <div className="mb-1 text-sm font-medium text-gray-700">{fileName}</div>
      )}
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {status || (normalizedProgress === 100 ? 'Complete' : 'Uploading...')}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
