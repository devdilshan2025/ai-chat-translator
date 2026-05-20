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
            console.log(`Input: ${data.text} | Target Language: ${data.targetLang}`);

            // 💡 Dynamic Dynamic Prompt: Frontend එකෙන් එන භාෂාවට අනුව AI එක පරිවර්තනය කරයි
            const prompt = `
            You are an advanced multilingual chat translator.
            Detect the source language of the input text automatically.
            Input text: "${data.text}"
            
            Translate this input text completely into natural, clear, and contextually accurate "${data.targetLang}".
            - If the target is Sinhala, output it in proper Sinhala script (not Singlish).
            - Provide ONLY the translated output text, absolutely nothing else. No commentary, no explanations, no wrapping quotes.
            `;

            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.candidates && result.candidates[0].content) {
                const translatedText = result.candidates[0].content.parts[0].text.trim();
                console.log("✅ Dynamic Translation Success:", translatedText);

                // දත්ත නැවත Frontend එකට emit කිරීම
                io.emit('chat message', {
                    original: data.text,
                    translated: translatedText,
                    targetLang: data.targetLang,
                    senderId: socket.id 
                });
            }

        } catch (error) {
            console.error("❌ Error:", error.message);
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