const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('msg-input');
const messagesDiv = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // 1. සර්වර් එකට මැසේජ් එක යැවීම
    socket.emit('chat message', { text: message });
    
    // 2. UI එකේ User ගේ පරණ මැසේජ් එක Bubble එකක් විදියට පෙන්වීම
    createUserBubble(message);
    
    // 3. AI එක වැඩ කරනවා කියලා පෙන්වන්න indicator එක active කිරීම
    typingIndicator.style.display = 'block';
    messagesDiv.appendChild(typingIndicator); // Indicator එක හැමතිස්සෙම යටටම ගන්නවා
    
    input.value = '';
    scrollToBottom();
});

socket.on('chat message', (data) => {
    // AI එකෙන් උත්තරේ ආපු ගමන් Typing indicator එක නවත්වනවා
    typingIndicator.style.display = 'none';

    // AI Bubble එකක් හදනවා
    const wrapper = document.createElement('div');
    wrapper.classList.add('message-wrapper', 'ai');

    wrapper.innerHTML = `
        <div class="bubble">${data.translated}</div>
        <div class="meta-info">
            Translated from: "${data.original}"
            <button class="copy-btn" onclick="copyToClipboard('${data.translated.replace(/'/g, "\\'")}')">Copy</button>
        </div>
    `;

    messagesDiv.appendChild(wrapper);
    scrollToBottom();
});

function createUserBubble(text) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message-wrapper', 'user');

    wrapper.innerHTML = `
        <div class="bubble">${text}</div>
        <div class="meta-info">You</div>
    `;

    messagesDiv.appendChild(wrapper);
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Copy කරගන්නා Function එක
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard! 📋");
    });
}