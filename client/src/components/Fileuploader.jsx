// client/src/components/FileUploader.jsx
import React, { useState } from 'react';

export default function FileUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await onUpload(file);
      setFile(null);
    }
  };

  return (
    <div>
      <div 
        className={`border-2 border-dashed p-8 text-center rounded-lg transition-colors ${
          isDragging 
            ? 'border-black bg-gray-100' 
            : 'border-gray-300 hover:border-black'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        
        <p className="mb-2 text-gray-700">Drag & drop a file here, or</p>
        
        <label className="inline-block bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800">
          Browse Files
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      
      {file && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={handleUpload}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// client/src/components/FileList.jsx
import React from 'react';
import { format } from 'date-fns';

export default function FileList({ files, onDelete, isAdmin, userId }) {
  if (!files.length) {
    return <p className="text-gray-500">No files have been shared yet.</p>;
  }
  
  return (
    <div className="divide-y">
      {files.map(file => (
        <div key={file._id} className="py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 bg-black text-white rounded mr-3">
                {file.mimeType?.includes('image') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Uploaded by {file.uploadedBy?.name || 'Unknown'}</span>
                  <span>·</span>
                  <span>{format(new Date(file.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  <span>·</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <a 
                href={`${process.env.REACT_APP_API_URL}/api/files/${file._id}/download`}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
              {(isAdmin || file.uploadedBy._id === userId) && (
                <button
                  onClick={() => onDelete(file._id)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}