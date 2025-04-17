const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (sender === 'bot') {
        // Render as HTML for code blocks
        bubble.innerHTML = text;
    } else {
        bubble.textContent = text;
    }
    messageDiv.appendChild(bubble);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Highlight code and add copy buttons for bot messages
    if (sender === 'bot') {
        // Highlight all code blocks
        bubble.querySelectorAll('pre code').forEach(block => {
            if (window.hljs) window.hljs.highlightElement(block);
        });
        // Add copy buttons
        bubble.querySelectorAll('pre').forEach(pre => {
            if (!pre.querySelector('.copy-btn')) {
                const btn = document.createElement('button');
                btn.className = 'copy-btn';
                btn.textContent = 'Copy';
                btn.onclick = function() {
                    const code = pre.querySelector('code');
                    if (code) {
                        navigator.clipboard.writeText(code.innerText).then(() => {
                            btn.textContent = 'Copied!';
                            btn.classList.add('copied');
                            setTimeout(() => {
                                btn.textContent = 'Copy';
                                btn.classList.remove('copied');
                            }, 1200);
                        });
                    }
                };
                pre.appendChild(btn);
            }
        });
    }
}


async function botReply(userText) {
    // Show loading bubble
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'bubble';
    loadingBubble.textContent = '...';
    loadingDiv.appendChild(loadingBubble);
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // Hardcoded API key for demo purposes (do NOT use in production)
        const GROQ_API_KEY = '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';

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: 'You are an expert code-writing assistant. Assume the user wants programming help and code solutions unless it is clear otherwise. For every query, provide clear, correct, and complete code (with concise explanations), formatted in markdown triple backticks with the language specified. Encourage users to ask for code and always answer with code when possible.' },
                    { role: 'user', content: userText }
                ]
            })
        });
        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
        loadingBubble.innerHTML = renderMarkdown(aiMessage);
        // Highlight and add copy buttons
        loadingBubble.querySelectorAll('pre code').forEach(block => {
            if (window.hljs) window.hljs.highlightElement(block);
        });
        loadingBubble.querySelectorAll('pre').forEach(pre => {
            if (!pre.querySelector('.copy-btn')) {
                const btn = document.createElement('button');
                btn.className = 'copy-btn';
                btn.textContent = 'Copy';
                btn.onclick = function() {
                    const code = pre.querySelector('code');
                    if (code) {
                        navigator.clipboard.writeText(code.innerText).then(() => {
                            btn.textContent = 'Copied!';
                            btn.classList.add('copied');
                            setTimeout(() => {
                                btn.textContent = 'Copy';
                                btn.classList.remove('copied');
                            }, 1200);
                        });
                    }
                };
                pre.appendChild(btn);
            }
        });
    } catch (err) {
        loadingBubble.textContent = "Error: " + (err.message || 'Unable to reach AI server');
        if (err.message?.includes('401')) {
            loadingBubble.textContent += ". There was an error with the API request.";
        }
    }
}

// Basic markdown renderer for code blocks
function renderMarkdown(text) {
    // Replace triple backtick code blocks with <pre><code class="language-xxx">...</code></pre>
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang || ''}">${safeCode}</code></pre>`;
    });
}


chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (!userText) return;
    appendMessage('user', userText);
    userInput.value = '';
    botReply(userText);
});

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
function setTheme(mode) {
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', mode);
}
if (themeToggle) {
    themeToggle.onclick = () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
}
// On load, set theme from localStorage
window.onload = () => {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'dark' ? 'dark' : 'light');
    appendMessage('bot', "Hello! I'm your chatbot. How can I assist you today?");
};
