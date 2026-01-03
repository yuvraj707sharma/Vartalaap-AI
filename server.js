require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  let deepgramWs = null;

  clientWs.on('message', async (message) => {
    try {
      // Try to parse as JSON
      const data = JSON. parse(message. toString());

      // Handle start connection request from frontend
      if (data.type === 'start') {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        
        if (!apiKey) {
          clientWs.send(JSON. stringify({
            type: 'error',
            message: 'Deepgram API key not configured.  Add DEEPGRAM_API_KEY to .env file'
          }));
          return;
        }

        console.log('Starting Deepgram connection...');

        // Connect to Deepgram Agent API with Authorization header
        const deepgramUrl = 'wss://agent.deepgram.com/v1/agent/converse';
        deepgramWs = new WebSocket(deepgramUrl, {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        });

        deepgramWs.on('open', () => {
          console.log('✅ Connected to Deepgram Agent API');
          // DON'T send settings here - let frontend handle it after Welcome
        });

        deepgramWs.on('message', (deepgramMessage, isBinary) => {
          // Forward ALL messages from Deepgram to client (binary or JSON)
          if (clientWs.readyState === WebSocket.OPEN) {
            if (isBinary) {
              // Binary audio data
              clientWs.send(deepgramMessage);
            } else {
              // JSON message - log and forward
              try {
                const parsed = JSON.parse(deepgramMessage.toString());
                console.log('📥 Deepgram →', parsed. type);
              } catch (e) {
                // Not JSON, forward anyway
              }
              clientWs.send(deepgramMessage);
            }
          }
        });

        deepgramWs.on('error', (error) => {
          console.error('❌ Deepgram error:', error. message);
          clientWs.send(JSON.stringify({
            type: 'Error',
            description: `Deepgram connection error: ${error.message}`,
            code: 'CONNECTION_FAILED'
          }));
        });

        deepgramWs. on('close', (code, reason) => {
          console.log(`Deepgram connection closed:  ${code} - ${reason}`);
          clientWs.send(JSON.stringify({
            type: 'close',
            message: 'Deepgram connection closed'
          }));
        });

        return;
      }

      // Forward Settings and other JSON messages to Deepgram
      if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
        console.log('📤 Client →', data.type || 'unknown');
        deepgramWs.send(message);
      }

    } catch (error) {
      // Not JSON - treat as binary audio data
      if (deepgramWs && deepgramWs.readyState === WebSocket. OPEN) {
        deepgramWs.send(message);
      }
    }
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    if (deepgramWs) {
      deepgramWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('Client WebSocket error:', error);
  });
});

console.log('WebSocket server is ready');