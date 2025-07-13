// client/src/components/FileList.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function FileList({ files, onDelete, isAdmin, userId, onPreview }) {
  const { user, getToken } = useAuth();
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDownload = async (file) => {
    // Prevent multiple downloads of the same file
    if (downloadingFiles.has(file._id)) {
      toast.info('File is already being downloaded');
      return;
    }

    try {
      // Add file to downloading set
      setDownloadingFiles(prev => new Set(prev).add(file._id));

      // Get token from AuthContext
      const token = getToken();
      
      if (!token) {
        toast.error('You must be logged in to download files');
        return;
      }

      if (!user) {
        toast.error('Authentication required');
        return;
      }

      console.log('Attempting download for file:', file._id);
      console.log('User:', user);
      console.log('Using token:', token ? 'Token present' : 'No token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${file._id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Download response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed with response:', errorText);
        
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          return;
        }
        
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error.message}`);
    } finally {
      // Remove file from downloading set
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file._id);
        return newSet;
      });
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="mt-2">No files shared yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <div 
          key={file._id} 
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
          style={{
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.5s ease-out forwards'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • Uploaded {formatDate(file.createdAt)}
                </p>
                {file.uploadedBy && (
                  <p className="text-xs text-gray-400">by {file.uploadedBy.name}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(file)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              )}
              <button
                onClick={() => handleDownload(file)}
                disabled={downloadingFiles.has(file._id)}
                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
                  downloadingFiles.has(file._id) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800 hover:shadow-md'
                }`}
              >
                {downloadingFiles.has(file._id) ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Download
                  </>
                )}
              </button>
              {(isAdmin || file.uploadedBy?._id === userId) && (
                <button
                  onClick={() => onDelete(file._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 hover:shadow-md transition-all duration-200"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
