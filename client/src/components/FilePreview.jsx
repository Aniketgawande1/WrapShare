// client/src/components/FilePreview.jsx
import React, { useState } from 'react';

export default function FilePreview({ file, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
    if (['txt', 'md'].includes(extension)) return 'text';
    return 'other';
  };

  const fileType = getFileType(file.name);

  const renderPreview = () => {
    const fileUrl = `${import.meta.env.VITE_API_URL}/uploads/${file.filename}`;
    
    switch (fileType) {
      case 'image':
        return (
          <img 
            src={fileUrl} 
            alt={file.name}
            className="max-w-full max-h-96 mx-auto"
            onLoad={() => setLoading(false)}
          />
        );
      case 'video':
        return (
          <video 
            controls 
            className="max-w-full max-h-96 mx-auto"
            onLoadedData={() => setLoading(false)}
          >
            <source src={fileUrl} />
            Your browser does not support video playback.
          </video>
        );
      case 'audio':
        return (
          <div className="p-8">
            <audio 
              controls 
              className="w-full"
              onLoadedData={() => setLoading(false)}
            >
              <source src={fileUrl} />
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-96"
            onLoad={() => setLoading(false)}
          />
        );
      default:
        setLoading(false);
        return (
          <div className="p-8 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-600">Preview not available for this file type</p>
            <p className="text-sm text-gray-500">{file.name}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-full w-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading preview...</span>
            </div>
          )}
          {renderPreview()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Uploaded by {file.uploadedBy?.name || 'Unknown'}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <a
              href={`${import.meta.env.VITE_API_URL}/uploads/${file.filename}`}
              download={file.name}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
