
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
