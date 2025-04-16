const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());

// Serve static files (style.css, script.js, etc.)
app.use(express.static(__dirname));

// Serve index.html at root
const path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192', // Groq's best coding model, you can change to mixtral-8x7b-32768 or gemma-7b-it if needed
                messages: [
                    { role: 'system', content: 'You are an expert code-writing assistant. Assume the user wants programming help and code solutions unless it is clear otherwise. For every query, provide clear, correct, and complete code (with concise explanations), formatted in markdown triple backticks with the language specified. Encourage users to ask for code and always answer with code when possible.' },
                    { role: 'user', content: message }
                ]
            })
        });
        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
        res.json({ reply: aiMessage });
    } catch (err) {
        res.status(500).json({ error: 'Failed to contact OpenAI API.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
