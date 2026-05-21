const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fetch = require('node-fetch'); 
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 💡 CORS Error එන එක වළක්වන්න GitHub Pages ලින්ක් එකට මෙතනින් අවසර දුන්නා
const io = new Server(server, {
    cors: {
        origin: "*", // ඕනෑම තැනක සිට Connect වීමට ඉඩ දෙයි
        methods: ["GET", "POST"]
    }
});

const API_KEY = process.env.GEMINI_API_KEY;

// 💡 මෙන්න වෙනස: දැන් මුළු ප්‍රොජෙක්ට් එකේම තියෙන ෆයිල් Static විදිහට සර්ව් කරනවා
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 💡 යූසර් සර්වර් එකට ආපු ගමන් එළියේ තියෙන index.html එක ඕපන් කරනවා
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected! ✅');

    socket.on('chat message', async (data) => {
        try {
            if (!data.text || data.text.trim() === "") return;
            console.log(`Input: ${data.text} | Target Language: ${data.targetLang}`);

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

// 💡 පොට් එක 3001 තියාගත්තා, ඔයා main.js එකට දීපු පොට් එකමයි
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});