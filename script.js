// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAt4ar8NhtfLpMGZ8cz-pYPpBlmiNw5QxQ",
    authDomain: "codebot2.firebaseapp.com",
    projectId: "codebot2",
    storageBucket: "codebot2.firebasestorage.app",
    messagingSenderId: "960325836067",
    appId: "1:960325836067:web:cc3878f5a4c76ee03e0096",
    measurementId: "G-TCYL9N99L0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const logoutBtn = document.getElementById('logout-btn');

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadChatHistory();
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load chat history from Firestore
async function loadChatHistory() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const q = query(
            collection(db, 'chats'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        
        const snapshot = await getDocs(q);
        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });

        // Display messages in chronological order
        messages.reverse().forEach(msg => {
            appendMessage(msg.sender, msg.text, msg.timestamp);
        });
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Save message to Firestore
async function saveMessage(sender, text) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await addDoc(collection(db, 'chats'), {
            userId: user.uid,
            sender: sender,
            text: text,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

function appendMessage(sender, text, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (sender === 'bot') {
        const avatar = document.createElement('img');
        avatar.src = 'P lightening.png';
        avatar.alt = 'Bot Avatar';
        avatar.className = 'avatar';
        messageContent.appendChild(avatar);
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    if (sender === 'bot') {
        bubble.innerHTML = text;
    } else {
        bubble.textContent = text;
    }

    if (timestamp) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date(timestamp.toDate()).toLocaleTimeString();
        bubble.appendChild(timeSpan);
    }

    messageContent.appendChild(bubble);
    messageDiv.appendChild(messageContent);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (sender === 'bot') {
        bubble.querySelectorAll('pre code').forEach(block => {
            if (window.hljs) window.hljs.highlightElement(block);
        });
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
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'bubble';
    loadingBubble.textContent = '...';
    loadingDiv.appendChild(loadingBubble);
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
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
        
        // Save the bot's response to Firestore
        await saveMessage('bot', aiMessage);

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

function renderMarkdown(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang || ''}">${safeCode}</code></pre>`;
    });
}

chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (!userText) return;

    appendMessage('user', userText);
    await saveMessage('user', userText);
    userInput.value = '';
    botReply(userText);
});

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
function setTheme(mode) {
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    }
    localStorage.setItem('theme', mode);
}

if (themeToggle) {
    themeToggle.onclick = () => {
        const isLight = document.body.classList.toggle('light-mode');
        themeToggle.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}

// On load, set theme from localStorage or default to dark
window.onload = () => {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'light' ? 'light' : 'dark');
    appendMessage('bot', "Hello! I'm your chatbot. How can I assist you today?");
};
