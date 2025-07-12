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