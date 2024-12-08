// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import WFC from './WFC.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', async (socket) => {
  const wfc = await WFC.init(socket, 25);
  wfc.start();
});

server.listen(3300, () => {
  console.log('Server running');
});
