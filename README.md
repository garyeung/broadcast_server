# Broadcast Server
(https://roadmap.sh/projects/broadcast-server)  
A real-time broadcast server implementation using WebSocket protocol.  
This serveer supports user authentication, real-time messaging, and user status tracking.

## Features
- Real-time WebSocket communication
- Username-based authenticaiton
- User presence trakcing (join/leave notifications)
- Broadcast messaging system
- Connection state mamagement
- Error handling and connection recovery
- TypeScript support

## Prerequisites
- Node.js (latest)
- npm or yarn
- TypeScript

## Installation
```sh
git clone https://github.com/garyeung/broadcast_server.git 

cd broadcast_server 
 
npm install 
```

## Usages
```bash
# development
$ npm run dev 

# build
$ npm run build     

# start
$ npm run broadcast-server

```

## Project Structure
```stylus
├── src/
│   ├── cli.ts               # Commander implementation
│   ├── client.ts            # Client server implementation
│   ├── broadcastServer.ts   # Broadcast server implementation
│   ├── config.ts            # Configuration and types
│   └── index.ts             # Entry point
│
├── package.json
├── tsconfig.json
└── README.md
```
