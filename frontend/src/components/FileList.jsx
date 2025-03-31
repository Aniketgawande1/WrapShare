import React from 'react';

const FileList = ({ files, onRemoveFile, uploadProgress }) => {
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    } else if (mimeType.startsWith('video/')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      );
    } else if (mimeType.startsWith('audio/')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        <p>No files selected yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
      <h3 className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-lg font-medium">Selected Files</h3>
      <ul>
        {files.map((file, index) => (
          <li key={`${file.name}-${index}`} className="border-b border-gray-200 last:border-b-0">
            <div className="flex items-center px-4 py-3">
              <div className="text-gray-500 mr-3">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  {uploadProgress && uploadProgress[file.name] !== undefined && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {uploadProgress[file.name] < 100 
                        ? `${uploadProgress[file.name]}%` 
                        : 'Uploaded'}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onRemoveFile(index)}
                className="ml-4 p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;