// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    const interval = setInterval(() => {
        const data = Array.from({ length: 25 }, () => Math.random() > 0.5 ? '🟩' : '⬛');
        socket.emit('gridData', data);
      }, 2000);
    
      socket.on('disconnect', () => {
        clearInterval(interval);
      });
    });

server.listen(3000, () => {
  console.log('Server running at 3000');
});
