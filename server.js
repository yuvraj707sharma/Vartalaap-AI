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

/**
 * Returns system prompt based on the selected mode
 * @param {string} mode - The practice mode: "Tech", "UPSC", or "General"
 * @returns {string} System prompt for the selected mode
 */
function getSystemPrompt(mode) {
  const prompts = {
    Tech: "You are a knowledgeable technical interviewer conducting a practice session. Ask relevant questions about programming, software development, data structures, algorithms, system design, and other technical topics. Provide constructive feedback and help the candidate improve their technical communication skills. Be professional yet encouraging.",
    
    UPSC: "You are an experienced UPSC (Union Public Service Commission) interviewer. Conduct a mock interview covering topics like current affairs, Indian polity, economy, geography, history, and general knowledge. Ask thought-provoking questions that test the candidate's analytical thinking, awareness, and articulation. Maintain a formal and professional tone.",
    
    General: "You are a friendly conversational partner helping someone practice their communication skills. Engage in casual but meaningful conversations on various topics. Ask open-ended questions, show interest in their responses, and help them build confidence in expressing their thoughts clearly. Be supportive and encouraging."
  };

  return prompts[mode] || prompts.General;
}

// WebSocket connection handler
wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  let deepgramWs = null;
  let currentMode = 'General';

  clientWs.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      // Handle mode selection
      if (data.type === 'mode') {
        currentMode = data.mode;
        console.log(`Mode set to: ${currentMode}`);
        return;
      }

      // Handle start connection
      if (data.type === 'start') {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        
        if (!apiKey) {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Deepgram API key not configured'
          }));
          return;
        }

        // Connect to Deepgram Agent API
        const deepgramUrl = `wss://agent.deepgram.com/agent?api_key=${apiKey}`;
        deepgramWs = new WebSocket(deepgramUrl);

        deepgramWs.on('open', () => {
          console.log('Connected to Deepgram');
          
          // Send configuration to Deepgram
          const config = {
            type: 'SettingsConfiguration',
            audio: {
              input: {
                encoding: 'linear16',
                sample_rate: 16000
              },
              output: {
                encoding: 'linear16',
                sample_rate: 16000,
                container: 'none'
              }
            },
            agent: {
              listen: {
                model: 'nova-2'
              },
              think: {
                provider: {
                  type: 'open_ai'
                },
                model: 'gpt-4o',
                instructions: getSystemPrompt(currentMode)
              },
              speak: {
                model: 'aura-asteria-en'
              }
            },
            context: {
              messages: [],
              replay: true
            },
            endpointing: 200
          };

          deepgramWs.send(JSON.stringify(config));
          
          // Notify client that connection is ready
          clientWs.send(JSON.stringify({
            type: 'ready',
            message: 'Connected to Deepgram'
          }));
        });

        deepgramWs.on('message', (deepgramMessage) => {
          // Forward Deepgram messages to client
          clientWs.send(deepgramMessage);
        });

        deepgramWs.on('error', (error) => {
          console.error('Deepgram error:', error);
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Deepgram connection error'
          }));
        });

        deepgramWs.on('close', () => {
          console.log('Deepgram connection closed');
          clientWs.send(JSON.stringify({
            type: 'close',
            message: 'Deepgram connection closed'
          }));
        });

        return;
      }

      // Forward audio data to Deepgram
      if (data.type === 'audio' && deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(message);
      }

    } catch (error) {
      // If not JSON, treat as binary audio data
      if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
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
