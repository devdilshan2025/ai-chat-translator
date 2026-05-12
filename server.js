const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Frontend files (public folder එකේ තියෙන දේවල්) පෙන්වීමට
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User කෙනෙක් සම්බන්ධ වුණා!');

    socket.on('chat message', (data) => {
        // ලැබෙන පණිවිඩය අනෙක් අයට යැවීම
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('User කෙනෙක් ඉවත් වුණා');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server එක පණ ගැන්වුණා: http://localhost:${PORT}`);
});