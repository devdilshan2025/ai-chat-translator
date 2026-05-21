// 💡 මෙන්න මේක වැදගත්ම දේ: 
// දැනට local රන් කරනවා නම් 'http://localhost:3000' දාන්න. 
// Backend එක live හොස්ට් කරපු දවසට ඔයාගේ Live Backend URL එක මෙතනට දාන්න (උදා: 'https://my-backend.render.com')
const socket = io('http://localhost:3001'); 

const form = document.getElementById('chat-form');
const input = document.getElementById('msg-input');
const messagesDiv = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const langSelect = document.getElementById('target-lang'); 

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    const selectedLanguage = langSelect.value; 

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
    // මැසේජ් එකක් ආපු ගමන් ටයිපින් ඉන්ඩිකේටර් එක අයින් කරනවා
    if (typingIndicator.parentNode === messagesDiv) {
        messagesDiv.removeChild(typingIndicator);
    }
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