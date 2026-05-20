const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('msg-input');
const messagesDiv = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const langSelect = document.getElementById('target-lang'); // 💡 Dropdown එක ගන්නවා

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    const selectedLanguage = langSelect.value; // 💡 තෝරපු භාෂාව

    // සර්වර් එකට මැසේජ් එක සහ Target භාෂාව යවනවා
    socket.emit('chat message', { 
        text: message,
        targetLang: selectedLanguage 
    });
    
    typingIndicator.style.display = 'block';
    messagesDiv.appendChild(typingIndicator);
    
    input.value = '';
    scrollToBottom();
});

socket.on('chat message', (data) => {
    typingIndicator.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.classList.add('message-wrapper');

    if (data.senderId === socket.id) {
        // මම යවපු මැසේජ් එක (දකුණට)
        wrapper.classList.add('user');
        wrapper.innerHTML = `
            <div class="bubble">${data.original}</div>
            <div class="meta-info">You (Sent)</div>
        `;
    } else {
        // අනෙක් කෙනාට පෙනෙන පරිවර්තනය (වමට)
        wrapper.classList.add('ai');
        wrapper.innerHTML = `
            <div class="bubble">${data.translated}</div>
            <div class="meta-info">
                Translated to ${data.targetLang} from: "${data.original}"
                <button class="copy-btn" onclick="copyToClipboard('${data.translated.replace(/'/g, "\\'")}')">Copy</button>
            </div>
        `;
    }

    messagesDiv.appendChild(wrapper);
    scrollToBottom();
});

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard! 📋");
    });
}