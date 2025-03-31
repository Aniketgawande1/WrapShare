// import React, { useState, useEffect } from 'react';
// import FileUploader from '../components/FileUploader';
// import FileList from '../components/FileList';
// import ProgressBar from '../components/ProgressBar';
// // import { uploadFile, getFilesList } from '../services/api';

// const Home = () => {
//   const [files, setFiles] = useState([]);
//   const [uploadProgress, setUploadProgress] = useState({});
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState('');

//   // Fetch already uploaded files on component mount
//   useEffect(() => {
//     const fetchUploadedFiles = async () => {
//       try {
//         const filesList = await getFilesList();
//         setUploadedFiles(filesList);
//       } catch (err) {
//         setError('Failed to fetch uploaded files. Please try again later.');
//         console.error('Error fetching files:', err);
//       }
//     };

//     fetchUploadedFiles();
//   }, []);

//   const handleFilesAdded = (newFiles) => {
//     setFiles(prevFiles => [...prevFiles, ...newFiles]);
//     setError('');
//   };

//   const handleRemoveFile = (index) => {
//     setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
//     const newProgress = { ...uploadProgress };
//     if (files[index] && newProgress[files[index].name]) {
//       delete newProgress[files[index].name];
//       setUploadProgress(newProgress);
//     }
//   };

//   const handleUpload = async () => {
//     if (files.length === 0) {
//       setError('Please select at least one file to upload.');
//       return;
//     }

//     setIsUploading(true);
//     setError('');

//     for (const file of files) {
//       try {
//         await uploadFile(file, (progress) => {
//           setUploadProgress(prev => ({
//             ...prev,
//             [file.name]: progress
//           }));
//         });

//         setUploadedFiles(prev => [...prev, {
//           name: file.name,
//           size: file.size,
//           type: file.type,
//           url: URL.createObjectURL(file),
//           uploadDate: new Date().toISOString()
//         }]);

//       } catch (err) {
//         setError(`Failed to upload ${file.name}. ${err.message || 'Please try again.'}`);
//         console.error('Upload error:', err);
//       }
//     }

//     setIsUploading(false);
//     setFiles([]);
//   };

//   const handleDownloadFile = (fileUrl, fileName) => {
//     const a = document.createElement('a');
//     a.href = fileUrl;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   // Calculate total upload progress
//   const calculateTotalProgress = () => {
//     if (files.length === 0) return 0;
//     const totalProgress = Object.values(uploadProgress).reduce((sum, current) => sum + current, 0);
//     return totalProgress / files.length;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <h1 className="text-3xl font-bold text-gray-900">File Sharing App</h1>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="px-4 py-6 sm:px-0">
//           {/* Upload Section */}
//           <div className="bg-white shadow rounded-lg p-6 mb-8">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Files</h2>
//             <FileUploader onFilesAdded={handleFilesAdded} />
            
//             {files.length > 0 && (
//               <>
//                 <FileList 
//                   files={files} 
//                   onRemoveFile={handleRemoveFile} 
//                   uploadProgress={uploadProgress}
//                 />
                
//                 {isUploading ? (
//                   <div className="mt-6">
//                     <ProgressBar 
//                       progress={calculateTotalProgress()} 
//                       status={`Uploading ${Object.keys(uploadProgress).length} of ${files.length} files...`}
//                     />
//                   </div>
//                 ) : (
//                   <div className="mt-6">
//                     <button 
//                       onClick={handleUpload} 
//                       disabled={files.length === 0}
//                       className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}

//             {error && (
//               <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
//                 {error}
//               </div>
//             )}
//           </div>

//           {/* Uploaded Files Section */}
//           <div className="bg-white shadow rounded-lg p-6">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Files</h2>
            
//             {uploadedFiles.length > 0 ? (
//               <div className="space-y-4">
//                 {uploadedFiles.map((file, index) => (
//                   <div key={index} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
//                         <p className="text-sm text-gray-500">
//                           Uploaded: {new Date(file.uploadDate).toLocaleString()}
//                         </p>
//                       </div>
//                       <button 
//                         onClick={() => handleDownloadFile(file.url, file.name)}
//                         className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                       >
//                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
//                         </svg>
//                         Download
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No files have been uploaded yet</p>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Home;
import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast'; // Assume we're using react-hot-toast for notifications
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import { uploadFile, getFilesList, deleteFile } from '../services/api';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch already uploaded files
  const fetchUploadedFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const filesList = await getFilesList();
      setUploadedFiles(filesList);
      setError('');
    } catch (err) {
      setError('Failed to fetch uploaded files. Please try again later.');
      toast.error('Could not load your files.');
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  const handleFilesAdded = (newFiles) => {
    // Check for duplicate files
    const existingFileNames = files.map(f => f.name);
    const uniqueNewFiles = newFiles.filter(file => !existingFileNames.includes(file.name));
    
    if (uniqueNewFiles.length < newFiles.length) {
      toast.warning('Some files were skipped because they were already selected');
    }
    
    setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      // Get the file being removed
      const fileToRemove = updatedFiles[index];
      
      // Remove file from state
      updatedFiles.splice(index, 1);
      
      // Also remove from progress tracking
      if (fileToRemove && uploadProgress[fileToRemove.name]) {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileToRemove.name];
          return newProgress;
        });
      }
      
      return updatedFiles;
    });
  };

  const handleDeleteUploadedFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
      console.error('Delete error:', err);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    
    // Keep track of successful uploads
    let successCount = 0;
    let errorCount = 0;

    const uploadPromises = files.map(async (file) => {
      try {
        await uploadFile(file, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        });

        successCount++;
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          id: Date.now() + '-' + file.name,
          uploadDate: new Date().toISOString()
        };
      } catch (err) {
        errorCount++;
        console.error(`Failed to upload ${file.name}:`, err);
        return null;
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
      
      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
      }
      
      // Show appropriate toast notifications
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} ${successCount === 1 ? 'file' : 'files'}`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} ${errorCount === 1 ? 'file' : 'files'}`);
        setError(`Failed to upload ${errorCount} ${errorCount === 1 ? 'file' : 'files'}. Please try again.`);
      }
    } catch (err) {
      setError('An unexpected error occurred during upload.');
      toast.error('Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setFiles([]);
      setUploadProgress({});
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error('Download failed');
      console.error('Download error:', err);
    }
  };

  // Calculate total upload progress
  const calculateTotalProgress = () => {
    if (files.length === 0) return 0;
    const totalProgress = Object.values(uploadProgress).reduce((sum, current) => sum + current, 0);
    return totalProgress / files.length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">File Sharing App</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Files</h2>
            <FileUploader onFilesAdded={handleFilesAdded} />
            
            {files.length > 0 && (
              <>
                <FileList 
                  files={files} 
                  onRemoveFile={handleRemoveFile} 
                  uploadProgress={uploadProgress}
                />
                
                {isUploading ? (
                  <div className="mt-6">
                    <ProgressBar 
                      progress={calculateTotalProgress()} 
                      status={`Uploading ${Object.keys(uploadProgress).length} of ${files.length} files...`}
                    />
                  </div>
                ) : (
                  <div className="mt-6">
                    <button 
                      onClick={handleUpload} 
                      disabled={files.length === 0}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                    </button>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-100">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Files Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Files</h2>
            
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : uploadedFiles.length > 0 ? (
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-gray-500 mr-3">
                          {file.type.startsWith('image/') ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(file.uploadDate).toLocaleString()} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          aria-label={`Download ${file.name}`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Download
                        </button>
                        <button 
                          onClick={() => handleDeleteUploadedFile(file.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          aria-label={`Delete ${file.name}`}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
                <p className="mt-2">No files have been uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Home;