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

// සර්වර් එකෙන් මැසේජ් එකක් ආපු ගමන් screen එකේ පෙන්වීම
socket.on('chat message', (data) => {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message');
    msgElement.innerHTML = `<strong>You:</strong> ${data.text}`;
    messagesDiv.appendChild(msgElement);
    
    // Auto scroll down
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});