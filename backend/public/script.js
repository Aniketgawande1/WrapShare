// let socket;
// let roomId;
// let receivedChunks = [];
// let fileMeta = {};
// let currentTransferId;

// document.getElementById('joinBtn').addEventListener('click', joinRoom);
// document.getElementById('sendBtn').addEventListener('click', sendFile);

// async function joinRoom() {
//   roomId = document.getElementById('roomId').value.trim();
//   if (!roomId) return;
  
//   const statusEl = document.getElementById('roomStatus');
//   statusEl.textContent = 'Connecting...';
//   statusEl.className = 'status';
  
//   try {
//     socket = new WebSocket(`wss://${window.location.hostname}:3000`);
    
//     socket.addEventListener('open', () => {
//       socket.send(JSON.stringify({ type: 'join', roomId }));
//       statusEl.textContent = `Connected to room: ${roomId}`;
//       statusEl.className = 'status status-success';
//       document.getElementById('transferSection').style.display = 'block';
//     });
    
//     socket.addEventListener('message', async (event) => {
//       const { type, payload, chunkId } = JSON.parse(event.data);
      
//       if (type === 'file-meta') {
//         receivedChunks = [];
//         fileMeta = payload;
//         currentTransferId = payload.transferId;
//         showStatus(`Receiving ${payload.name} (${formatFileSize(payload.size)})`, 'status-success');
//       }
      
//       if (type === 'file-chunk') {
//         receivedChunks[chunkId] = new Uint8Array(payload.data);
//         updateProgress();
//       }
      
//       if (type === 'transfer-complete') {
//         if (receivedChunks.length === 0) return;
        
//         const blob = new Blob(receivedChunks, { type: fileMeta.type });
//         const url = URL.createObjectURL(blob);
        
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = fileMeta.name;
//         link.textContent = `Download ${fileMeta.name}`;
//         link.className = 'download-link';
        
//         document.getElementById('noFiles').style.display = 'none';
//         document.getElementById('download').appendChild(link);
        
//         // Cleanup
//         link.addEventListener('click', () => {
//           setTimeout(() => URL.revokeObjectURL(url), 100);
//         });
//       }
      
//       if (type === 'system') {
//         showStatus(payload, 'status-success');
//       }
//     });
    
//     socket.addEventListener('error', (error) => {
//       statusEl.textContent = `Connection error: ${error.message}`;
//       statusEl.className = 'status status-error';
//     });
    
//     socket.addEventListener('close', () => {
//       statusEl.textContent = 'Disconnected';
//       statusEl.className = 'status status-error';
//     });
    
//   } catch (error) {
//     statusEl.textContent = `Error: ${error.message}`;
//     statusEl.className = 'status status-error';
//   }
// }

// async function sendFile() {
//   const fileInput = document.getElementById('fileInput');
//   const file = fileInput.files[0];
//   if (!file) return;
  
//   if (!socket || socket.readyState !== WebSocket.OPEN) {
//     showStatus('Not connected to a room', 'status-error');
//     return;
//   }
  
//   const CHUNK_SIZE = 16 * 1024; // 16KB
//   const transferId = crypto.randomUUID();
//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
//   showStatus(`Preparing to send ${file.name}...`, 'status-success');
  
//   // Send metadata first
//   socket.send(JSON.stringify({
//     type: 'file-meta',
//     roomId,
//     payload: {
//       name: file.name,
//       size: file.size,
//       type: file.type,
//       transferId
//     }
//   }));
  
//   // Read and send chunks
//   for (let chunkId = 0, offset = 0; offset < file.size; chunkId++, offset += CHUNK_SIZE) {
//     const chunk = file.slice(offset, offset + CHUNK_SIZE);
//     const arrayBuffer = await readFileChunk(chunk);
    
//     // Calculate hash for verification
//     const hash = await calculateHash(arrayBuffer);
    
//     socket.send(JSON.stringify({
//       type: 'file-chunk',
//       roomId,
//       chunkId,
//       payload: {
//         data: Array.from(new Uint8Array(arrayBuffer)),
//         hash
//       }
//     }));
    
//     // Update progress
//     const progress = Math.min(offset + CHUNK_SIZE, file.size) / file.size * 100;
//     updateProgress(progress);
    
//     // Small delay to prevent overwhelming the connection
//     await new Promise(resolve => setTimeout(resolve, 10));
//   }
  
//   // Finalize transfer
//   socket.send(JSON.stringify({
//     type: 'transfer-complete',
//     roomId,
//     payload: { transferId }
//   }));
  
//   showStatus(`File ${file.name} sent successfully!`, 'status-success');
// }

// // Helper functions
// function readFileChunk(chunk) {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = (e) => resolve(e.target.result);
//     reader.readAsArrayBuffer(chunk);
//   });
// }

// async function calculateHash(buffer) {
//   const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
//   return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
// }

// function updateProgress(percent) {
//   const progressBar = document.getElementById('transferProgress');
//   const progressText = document.getElementById('progressText');
  
//   if (percent !== undefined) {
//     progressBar.value = percent;
//     progressText.textContent = `${Math.round(percent)}%`;
//   } else {
//     const received = receivedChunks.filter(Boolean).length;
//     const total = Math.ceil(fileMeta.size / (16 * 1024));
//     const percent = Math.round((received / total) * 100);
//     progressBar.value = percent;
//     progressText.textContent = `${percent}% (${received}/${total} chunks)`;
//   }
// }

// function showStatus(message, className) {
//   const statusEl = document.getElementById('sendStatus');
//   statusEl.textContent = message;
//   statusEl.className = `status ${className}`;
// }

// function formatFileSize(bytes) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }



let socket;
let roomId;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let receivedChunks = [];
let fileMeta = {};

// UI Elements
const connectionStatus = document.getElementById('connectionStatus');
const roomStatus = document.getElementById('roomStatus');
const transferSection = document.getElementById('transferSection');
const joinBtn = document.getElementById('joinBtn');
const sendBtn = document.getElementById('sendBtn');

// Initialize UI
updateConnectionStatus(false);

// Event Listeners
joinBtn.addEventListener('click', joinRoom);
sendBtn.addEventListener('click', sendFile);

function updateConnectionStatus(isConnected) {
  connectionStatus.textContent = isConnected ? '🟢 Connected' : '🔴 Disconnected';
  connectionStatus.style.color = isConnected ? 'green' : 'red';
  transferSection.style.display = isConnected ? 'block' : 'none';
}

function joinRoom() {
  roomId = document.getElementById('roomId').value.trim();
  if (!roomId) return;

  roomStatus.textContent = 'Connecting...';
  roomStatus.className = 'status';

  // Close existing connection if any
  if (socket) socket.close();

  socket = new WebSocket(`ws://${window.location.hostname}:3000`);
  reconnectAttempts = 0;

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'join', roomId }));
    updateConnectionStatus(true);
    roomStatus.textContent = `Connected to room: ${roomId}`;
    roomStatus.className = 'status status-success';
  });

  socket.addEventListener('message', (event) => {
    const { type, payload } = JSON.parse(event.data);
    
    if (type === 'file-meta') {
      receivedChunks = [];
      fileMeta = payload;
      showStatus(`Receiving ${payload.name}...`, 'status-success');
    }
    
    if (type === 'file-chunk') {
      receivedChunks.push(new Uint8Array(payload.data));
      updateProgress();
    }
    
    if (type === 'file-complete') {
      createDownloadLink();
    }
    
    if (type === 'system') {
      showStatus(payload, 'status-info');
    }
  });

  socket.addEventListener('close', () => {
    handleDisconnection();
  });

  socket.addEventListener('error', () => {
    handleDisconnection();
  });
}

function handleDisconnection() {
  updateConnectionStatus(false);
  
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const delay = Math.min(5000, 1000 * (reconnectAttempts + 1));
    roomStatus.textContent = `Disconnected. Retrying in ${delay/1000}s... (Attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`;
    roomStatus.className = 'status status-error';
    
    setTimeout(() => {
      reconnectAttempts++;
      joinRoom();
    }, delay);
  } else {
    roomStatus.textContent = 'Connection failed. Please refresh the page.';
    roomStatus.className = 'status status-error';
  }
}

function sendFile() {
  const file = document.getElementById('fileInput').files[0];
  if (!file || !socket || socket.readyState !== WebSocket.OPEN) return;

  const CHUNK_SIZE = 16 * 1024;
  const reader = new FileReader();
  let offset = 0;

  // Send metadata
  socket.send(JSON.stringify({
    type: 'file-meta',
    roomId,
    payload: {
      name: file.name,
      size: file.size,
      type: file.type
    }
  }));

  reader.onload = function(e) {
    socket.send(JSON.stringify({
      type: 'file-chunk',
      roomId,
      payload: {
        data: Array.from(new Uint8Array(e.target.result))
      }
    }));

    offset += CHUNK_SIZE;
    if (offset < file.size) {
      readSlice(offset);
    } else {
      socket.send(JSON.stringify({ 
        type: 'file-complete', 
        roomId 
      }));
    }
  };

  function readSlice(o) {
    const slice = file.slice(o, o + CHUNK_SIZE);
    reader.readAsArrayBuffer(slice);
    updateProgress(o / file.size * 100);
  }

  readSlice(0);
}

function createDownloadLink() {
  const blob = new Blob(receivedChunks, { type: fileMeta.type });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileMeta.name;
  link.textContent = `Download ${fileMeta.name}`;
  link.className = 'download-link';
  
  document.getElementById('noFiles').style.display = 'none';
  document.getElementById('download').appendChild(link);
  
  link.addEventListener('click', () => {
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
}

function updateProgress(percent) {
  const progressBar = document.getElementById('transferProgress');
  const progressText = document.getElementById('progressText');
  
  if (percent !== undefined) {
    progressBar.value = percent;
    progressText.textContent = `${Math.round(percent)}%`;
  } else {
    const received = receivedChunks.length;
    const total = Math.ceil(fileMeta.size / (16 * 1024));
    const percent = Math.round((received / total) * 100);
    progressBar.value = percent;
    progressText.textContent = `${percent}%`;
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('sendStatus');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}
