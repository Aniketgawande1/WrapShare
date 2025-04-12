# 🌐 WebSocket File Share

A real-time file sharing application using WebSocket technology. Transfer files between devices without uploading to any cloud server.

![Demo Screenshot](https://i.imgur.com/your-screenshot.png) *(replace with actual screenshot)*

## ✨ Features

- **Peer-to-peer** file transfers
- **No file size limits** (browser memory dependent)
- **Cross-platform** (works on phones, tablets, computers)
- **No signups** or installations required
- **End-to-end encrypted** (WSS protocol)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Modern web browser

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/websocket-file-share.git
   cd websocket-file-share
Install dependencies:

bash
Copy
npm install
Start the server:

bash
Copy
node server.js
Open in browser:

Copy
http://localhost:3000
📱 How to Use
Local Network Sharing
Sender Device:

Open http://[your-local-ip]:3000

Join/create room (e.g., family-photos)

Select file → Click "Send"

Receiver Device:

Open same URL

Join same room name

File will appear automatically

Global Sharing (Internet)
Deploy server (see "Deployment" section)

Share your public URL (e.g., https://your-app.railway.app)

Follow same usage steps

🌍 Deployment
Option 1: Railway (Recommended)
Deploy on Railway

Connect your GitHub repo

Select server.js as entry point

Deploy!

Option 2: Render
Create new "Web Service"

Set environment to Node.js

Point to your repository

🛠️ Technical Stack
Component	Technology
Backend	Node.js + Express
Real-time	WebSocket (ws library)
Frontend	Vanilla JavaScript
Security	WSS Encryption
📚 Documentation
Room System
Room names are case-sensitive

Rooms persist while at least 1 user is connected

Maximum 20 users per room (configurable)

File Transfer Process
Metadata exchange (filename, size)

Chunked transfer (16KB packets)

Receiver reassembles file

Download prompt appears

🚨 Troubleshooting
Issue	Solution
Can't connect	1. Check server is running
2. Disable firewall temporarily
File stuck at 0%	Try smaller file first (<10MB)
Browser warning	Use HTTPS for WSS connections
🤝 Contributing
Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some amazing feature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
Distributed under the MIT License. See LICENSE for more information.

📬 Contact
Your Name - @yourtwitter - youremail@example.com

Project Link: https://github.com/yourusername/websocket-file-share

Copy

### Key Sections Explained:

1. **Features**: Highlights what makes your project special
2. **Quick Start**: Gets users running locally fast
3. **Usage**: Visual guide for both local and global sharing
4. **Deployment**: One-click options for going live
5. **Troubleshooting**: Common issues and fixes

### How to Customize:
1. Replace `yourusername` with your GitHub username
2. Add actual screenshot (upload to Imgur)
3. Update contact information
4. Add your own deployment instructions if needed
