const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('msg-input');
const messagesDiv = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value;

    // සර්වර් එකට මැසේජ් එක යැවීම
    socket.emit('chat message', { text: message });
    input.value = '';
});

socket.on('chat message', (data) => {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message');
    
    // මුල් පණිවිඩය සහ පරිවර්තනය ලස්සනට පෙන්වීම
    msgElement.innerHTML = `
        <div style="font-size: 0.9em; color: #555;">Original: ${data.original}</div>
        <div style="font-weight: bold; color: #0084ff;">Translated: ${data.translated}</div>
    `;
    
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});