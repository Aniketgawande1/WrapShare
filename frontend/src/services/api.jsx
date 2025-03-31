// api.js
/**
 * API service for file operations and authentication
 */

// Simulate storage with localStorage
const STORAGE_KEYS = {
    FILES: 'file_sharing_app_files',
    AUTH: 'file_sharing_app_auth'
  };
  
  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  export const checkAuthStatus = async () => {
    try {
      const authData = localStorage.getItem(STORAGE_KEYS.AUTH);
      return !!authData; // Return true if auth data exists
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };
  
  /**
   * Log in a user
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<Object>} User data
   */
  export const login = async (email, password) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, accept any non-empty credentials
      const userData = { email, name: email.split('@')[0], loggedInAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };
  
  /**
   * Register a new user
   * @param {string} name User's name
   * @param {string} email User's email
   * @param {string} password User's password
   * @returns {Promise<Object>} User data
   */
  export const signup = async (name, email, password) => {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user
      const userData = { name, email, createdAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };
  
  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  export const logout = async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Logout failed. Please try again.');
    }
  };
  
  /**
   * Get list of uploaded files
   * @returns {Promise<Array>} List of files
   */
  export const getFilesList = async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
      return files;
    } catch (error) {
      console.error('Failed to fetch files:', error);
      throw new Error('Could not retrieve files. Please try again later.');
    }
  };
  
  /**
   * Upload a file
   * @param {File} file File to upload
   * @param {Function} progressCallback Callback for upload progress
   * @returns {Promise<Object>} Uploaded file data
   */
  export const uploadFile = async (file, progressCallback = () => {}) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      // Validate file size (10MB max)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit (10MB)`);
      }
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        progressCallback(Math.floor(progress));
        
        if (progress === 100) clearInterval(interval);
      }, 300);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create file object to store
      const fileData = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadDate: new Date().toISOString()
      };
      
      // Save to "storage"
      const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
      files.push(fileData);
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
      
      // Clear interval just in case
      clearInterval(interval);
      progressCallback(100);
      
      return fileData;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(error.message || 'Upload failed. Please try again.');
    }
  };
  
  /**
   * Delete a file
   * @param {string} fileId ID of file to delete
   * @returns {Promise<boolean>} Success status
   */
  export const deleteFile = async (fileId) => {
    try {
      if (!fileId) {
        throw new Error('File ID is required');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove from storage
      const files = JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES) || '[]');
      const updatedFiles = files.filter(file => file.id !== fileId);
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(updatedFiles));
      
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error('Could not delete file. Please try again.');
    }
  };
  
  /**
   * Share a file with another user
   * @param {string} fileId ID of file to share
   * @param {string} email Email of user to share with
   * @returns {Promise<Object>} Share data
   */
  export const shareFile = async (fileId, email) => {
    try {
      if (!fileId || !email) {
        throw new Error('File ID and email are required');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Just return success for demo
      return { 
        success: true, 
        shareId: `share_${Date.now()}`,
        shareUrl: `https://example.com/shared/${fileId}?token=${Date.now()}` 
      };
    } catch (error) {
      console.error('Share failed:', error);
      throw new Error('Could not share file. Please try again.');
    }
  };