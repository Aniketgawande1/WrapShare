let socket;
let roomId;

function joinRoom() {
  roomId = document.getElementById("roomId").value;
  socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", roomId }));
  });

  socket.addEventListener("message", (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "file-meta") {
      receivedChunks = [];
      fileMeta = payload;
    }

    if (type === "file-chunk") {
      receivedChunks.push(new Uint8Array(payload.data));
    }

    if (type === "file-complete") {
      const blob = new Blob(receivedChunks);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileMeta.name;
      link.textContent = `Download ${fileMeta.name}`;
      document.getElementById("download").appendChild(link);
    }
  });
}

function sendFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file || !socket || socket.readyState !== WebSocket.OPEN) return;

  const chunkSize = 16 * 1024; // 16 KB
  const reader = new FileReader();
  let offset = 0;

  socket.send(JSON.stringify({
    type: "file-meta",
    roomId,
    payload: { name: file.name, size: file.size, type: file.type }
  }));

  reader.onload = function () {
    socket.send(JSON.stringify({
      type: "file-chunk",
      roomId,
      payload: reader.result
    }));

    offset += chunkSize;
    if (offset < file.size) readSlice(offset);
    else {
      socket.send(JSON.stringify({ type: "file-complete", roomId }));
    }
  };

  function readSlice(o) {
    const slice = file.slice(o, o + chunkSize);
    reader.readAsArrayBuffer(slice);
  }

  readSlice(0);
}
