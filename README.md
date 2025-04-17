# AI Code Writing Chatbot

A modern chatbot web app that writes code, answers programming questions, and provides copyable, syntax-highlighted code blocks. Built with HTML, CSS, JavaScript, and a Node.js backend using Llama 3 (Groq API) or OpenAI GPT.

---

## Features
- **Code writing bot:** Always provides code and explanations for programming queries.
- **Copyable code:** One-click copy button for every code block.
- **Syntax highlighting:** Uses highlight.js for beautiful code display.
- **Responsive UI:** Works on desktop and mobile, supports dark/light mode toggle.

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies (for backend)
```bash
npm install
```

### 3. Set your API Key

#### For Groq (Llama 3, fast & free):
1. Sign up at [Groq Cloud](https://console.groq.com/) and get your API key.
2. Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   ```

#### For OpenAI (GPT-4/3.5):
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).
2. Add to `.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

**Never commit your API key to a public repo!**

---

### 4. Run the backend server
```bash
node server.js
```
The server will run at `http://localhost:3000` by default.

### 5. Open the chatbot
- Open `index.html` in your browser for local use.
- Or deploy frontend (static files) to GitHub Pages, Vercel, Netlify, etc.
- Make sure `script.js` points to your deployed backend API endpoint.

---

## Deployment
- **Frontend:** Can be hosted on GitHub Pages (static), Vercel, Netlify, etc.
- **Backend:** Deploy Node.js server to Render, Vercel, Railway, or your own VPS.

---

## API Key Example
```
GROQ_API_KEY=gsk_JkTem____________________Y5chX____________q7hx
```

- Replace with your own key from Groq or OpenAI.
- **Do NOT share your real key publicly!**

---

## Credits
- [Groq Cloud](https://console.groq.com/) (Llama 3 API)
- [OpenAI](https://platform.openai.com/)
- [highlight.js](https://highlightjs.org/)

---

## License