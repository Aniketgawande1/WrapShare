// client/src/components/FileManager.jsx
import React, { useState } from 'react';
import FileList from './FileList';
import FilePreview from './FilePreview';

export default function FileManager({ files, onDelete, isAdmin, userId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'size', 'type'
  const [filterType, setFilterType] = useState('all');

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
    return 'other';
  };

  const getTypeIcon = (type) => {
    const icons = {
      image: '🖼️',
      pdf: '📄',
      document: '📝',
      video: '🎥',
      audio: '🎵',
      archive: '📦',
      other: '📎'
    };
    return icons[type] || '📎';
  };

  const filterFiles = (files) => {
    let filtered = files;
    
    if (filterType !== 'all') {
      filtered = files.filter(file => getFileType(file.name) === filterType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'type':
          return getFileType(a.name).localeCompare(getFileType(b.name));
        case 'date':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const fileTypes = ['all', 'image', 'document', 'pdf', 'video', 'audio', 'archive', 'other'];
  const filteredFiles = filterFiles(files);

  const getFileStats = () => {
    const stats = files.reduce((acc, file) => {
      const type = getFileType(file.name);
      acc[type] = (acc[type] || 0) + 1;
      acc.totalSize += file.size;
      return acc;
    }, { totalSize: 0 });
    
    return stats;
  };

  const stats = getFileStats();

  return (
    <div className="space-y-4">
      {/* File Manager Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* File Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="font-medium">{files.length} files</span>
            <span>{(stats.totalSize / (1024 * 1024)).toFixed(1)} MB total</span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {fileTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : `${getTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="type">Sort by Type</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(stats).filter(([key]) => key !== 'totalSize' && stats[key] > 0).map(([type, count]) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {getTypeIcon(type)} {count} {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* File List/Grid */}
      {viewMode === 'list' ? (
        <FileList 
          files={filteredFiles} 
          onDelete={onDelete} 
          isAdmin={isAdmin} 
          userId={userId}
          onPreview={setPreviewFile}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setPreviewFile(file)}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{getTypeIcon(getFileType(file.name))}</div>
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
