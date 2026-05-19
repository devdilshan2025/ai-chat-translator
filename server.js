const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fetch = require('node-fetch'); 
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const API_KEY = process.env.GEMINI_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User connected! ✅');

    socket.on('chat message', async (data) => {
        try {
            if (!data.text || data.text.trim() === "") return;
            console.log("Input received:", data.text);

            // 💡 දැනට තියෙන අලුත්ම සහ ස්ථාවරම URL එක (v1 + gemini-2.5-flash)
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Translate this text to English. Give ONLY the English translation, no extra notes: ${data.text}`
                        }]
                    }]
                })
            });

            const result = await response.json();

            // පළමු එක (gemini-2.5-flash) Fail වුණොත් අපි gemini-2.0-flash බලමු
            if (result.error) {
                console.log(`🔄 gemini-2.5-flash failed (${result.error.message}), trying gemini-2.0-flash...`);
                
                const backupUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
                const backupResponse = await fetch(backupUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Translate this text to English. Give ONLY the translation: ${data.text}` }] }]
                    })
                });
                
                const backupResult = await backupResponse.json();
                
                if (backupResult.error) {
                    throw new Error(backupResult.error.message);
                }
                
                const translatedText = backupResult.candidates[0].content.parts[0].text.trim();
                console.log("✅ Success with Backup Model:", translatedText);
                io.emit('chat message', { original: data.text, translated: translatedText });
                return;
            }

            if (result.candidates && result.candidates[0].content) {
                const translatedText = result.candidates[0].content.parts[0].text.trim();
                console.log("✅ Success with Main Model:", translatedText);

                io.emit('chat message', {
                    original: data.text,
                    translated: translatedText
                });
            } else {
                throw new Error("Unexpected API response format");
            }

        } catch (error) {
            console.error("❌ Error during translation:", error.message);
            socket.emit('chat message', { 
                original: data.text, 
                translated: `⚠️ (AI Error: ${error.message.substring(0, 40)})` 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected ❌');
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});