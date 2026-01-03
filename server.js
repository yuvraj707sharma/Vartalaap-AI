require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const { createClient } = require('@deepgram/sdk');
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
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on('connection', async (clientWs) => {
  console.log('Client connected');
  
  let deepgramAgent = null;

  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Deepgram API key not configured.  Add DEEPGRAM_API_KEY to . env file'
      }));
      clientWs.close();
      return;
    }

    // Initialize Deepgram client using SDK
    const deepgram = createClient(apiKey);

    clientWs.on('message', async (message) => {
      try {
        // Try to parse as JSON
        const data = JSON.parse(message. toString());

        // Handle start connection request from frontend
        if (data.type === 'start') {
          console.log('Starting Deepgram connection...');

          // Create agent connection using SDK
          const agent = deepgram.agent();
          deepgramAgent = agent;

          // Forward Welcome message from Deepgram to client
          agent.on('Welcome', (data) => {
            console.log('✅ Connected to Deepgram Agent API');
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Forward SettingsApplied message from Deepgram to client
          agent.on('SettingsApplied', (data) => {
            console.log('📥 Deepgram → SettingsApplied');
            if (clientWs. readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Forward ConversationText events
          agent.on('ConversationText', (data) => {
            console.log('📥 Deepgram → ConversationText:', data. role);
            if (clientWs. readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Forward UserStartedSpeaking events
          agent.on('UserStartedSpeaking', (data) => {
            console.log('📥 Deepgram → UserStartedSpeaking');
            if (clientWs. readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Forward AgentThinking events
          agent.on('AgentThinking', (data) => {
            console.log('📥 Deepgram → AgentThinking');
            if (clientWs. readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Forward AgentAudioDone events
          agent.on('AgentAudioDone', (data) => {
            console.log('📥 Deepgram → AgentAudioDone');
            if (clientWs.readyState === 1) {
              clientWs.send(JSON. stringify(data));
            }
          });

          // Forward audio chunks from Deepgram to client
          agent.on('Audio', (audioData) => {
            if (clientWs.readyState === 1) {
              clientWs.send(audioData, { binary: true });
            }
          });

          // Forward Error events
          agent.on('Error', (error) => {
            console. error('❌ Deepgram error:', error);
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify({
                type: 'Error',
                description: error.message || 'Unknown error occurred',
                code: error.code || 'PROVIDER_ERROR'
              }));
            }
          });

          // Forward Warning events
          agent.on('Warning', (data) => {
            console.warn('⚠️ Deepgram warning:', data);
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify(data));
            }
          });

          // Handle agent close
          agent.on('Close', () => {
            console.log('Deepgram agent connection closed');
            if (clientWs.readyState === 1) {
              clientWs.send(JSON.stringify({
                type: 'close',
                message: 'Deepgram connection closed'
              }));
            }
          });

          return;
        }

        // Handle Settings message
        if (data.type === 'Settings' && deepgramAgent) {
          console.log('📤 Client → Settings');
          deepgramAgent.configure(data);
          return;
        }

        // Handle stop message
        if (data.type === 'stop' && deepgramAgent) {
          console.log('📤 Client → stop');
          try {
            await deepgramAgent. disconnect();
          } catch (e) {
            console.log('Error disconnecting:', e. message);
          }
          return;
        }

        // Forward other JSON messages to Deepgram
        if (deepgramAgent) {
          console.log('📤 Client →', data.type || 'unknown');
          deepgramAgent.send(JSON.stringify(data));
        }

      } catch (error) {
        // Not JSON - treat as binary audio data
        if (deepgramAgent) {
          deepgramAgent.send(message);
        }
      }
    });

    clientWs.on('close', async () => {
      console.log('Client disconnected');
      if (deepgramAgent) {
        try {
          await deepgramAgent.disconnect();
        } catch (error) {
          console.error('Error disconnecting Deepgram agent:', error);
        }
      }
    });

    clientWs.on('error', (error) => {
      console. error('Client WebSocket error:', error);
    });

  } catch (error) {
    console.error('Error initializing connection:', error);
    if (clientWs.readyState === 1) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize connection'
      }));
      clientWs.close();
    }
  }
});

console.log('WebSocket server is ready');