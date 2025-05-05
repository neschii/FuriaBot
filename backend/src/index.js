// backend/src/index.js (or server.js, based on your project structure)

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Import your chatbot service functions
const { handleMessage, getMainMenuMessages } = require('./services/chatbotService');
const { getSession, resetSession } = require('./stateManager');

// --- Add this import for your Twitch API utility ---
const { checkStreamStatus } = require('./utils/twitchApi');
// ----------------------------------------------------


const app = express();
const port = process.env.PORT || 3001; // Use port from env or default to 3001

// Configuração do CORS para permitir requisições do frontend
app.use(cors({
  origin: 'http://localhost:3000' // Permite apenas do frontend rodando em 3000
}));

app.use(express.json());

// Basic route for testing if the server is alive
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Endpoint para iniciar uma nova conversa e obter o menu inicial (Chatbot)
app.get('/api/chat/init', (req, res) => {
    const sessionId = uuidv4(); // Gera um novo ID de sessão para cada inicialização via GET
    getSession(sessionId); // Inicializa a sessão no stateManager (estado inicial 'main_menu')
    console.log(`Nova sessão iniciada com ID: ${sessionId}`);
    const initialMessages = getMainMenuMessages();
    res.json({ sessionId, messages: initialMessages });
});

// Endpoint principal para o chat (Chatbot)
app.post('/api/chat', async (req, res) => {
    const { sessionId, message, action } = req.body;

    if (!sessionId) {
        console.error("Missing sessionId in POST request body.");
        return res.status(400).json({ error: "sessionId é obrigatório." });
    }

    getSession(sessionId); // Garante que a sessão existe

    try {
        const botResponse = await handleMessage(sessionId, message, action);
        res.json(botResponse);
    } catch (error) {
        console.error(`Erro ao processar mensagem para sessão ${sessionId}:`, error);
        let fallbackMessages = [{ type: 'bot', text: 'Ocorreu um erro inesperado. Por favor, tente novamente.' }];
         try {
             resetSession(sessionId);
             fallbackMessages.push(...getMainMenuMessages());
         } catch (e) {
             console.error("Erro ao tentar resetar sessão após erro:", e);
         }

        res.status(500).json({ messages: fallbackMessages, error: error.message });
    }
});

// --- Add this new endpoint for fetching streamer status ---
app.get('/api/streamers', async (req, res) => {
  try {
    console.log('Received request for /api/streamers');
    // Call the function from your twitchApi utility file
    const streamers = await checkStreamStatus();
    // Send the fetched streamer data as a JSON response
    res.json(streamers);
  } catch (error) {
    // If checkStreamStatus fails, log the error and send a 500 response
    console.error('Error in /api/streamers route:', error);
    res.status(500).json({ error: 'Failed to get streamer status from backend' });
  }
});
// ----------------------------------------------------------


// Start the server listening on the specified port
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  // Optional: Log env vars to confirm they are loaded
  console.log(`Twitch streamers configured: ${process.env.TWITCH_STREAMERS}`);
  console.log(`Twitch Client ID set: ${!!process.env.TWITCH_CLIENT_ID}`);
});