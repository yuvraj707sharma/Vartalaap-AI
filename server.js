require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express. static(path.join(__dirname)));

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket. Server({ server });

/**
 * Returns system prompt based on the selected mode and language
 */
function getSystemPrompt(mode, language = 'Hindi') {
  const prompts = {
    'English Practice': `You are a strict, professional English Tutor and Language Drill Sergeant. 
Your goal is to make the candidate speak perfect, fluent English under pressure. 

YOUR BEHAVIOR RULES:
1. **THE "STOP" RULE:** If the user makes a grammar mistake (e.g., "I has done it"), interrupt IMMEDIATELY.  Say:  "STOP.  Grammar error.  It is 'I HAVE done it'.  Repeat the sentence correctly.  NOW."
2. **FORCE REPETITION:** Do not move to the next question until the user repeats the corrected sentence properly. 
3. **STAMMERING:** If the user says "Umm", "Uhh", or pauses, say:  "Remove the fillers. Speak clearly. Try again."
4. **HINGLISH:** If the user speaks in Hindi, translate it for them instantly and say: "In English, we say [Translation].  Now say it in English." If user continuously makes mistakes (2 times in a row) explain in ${language}. 
5. **TONE:** Commanding, serious, and fast.  Do not be polite.  Do not say "Please." Be a tough teacher.
6. **ROLEPLAY RULE:** When user says let's do a roleplay, then do the roleplay that user said. If user does not mention a particular roleplay and just says let's speak/practice in English, then do a roleplay from yourself and help user to practice speaking English.
7. **LANGUAGE BRIDGE (India-Specific):** If the user switches to Hindi or another Indian language, briefly explain in that language, then say: "Now answer in English."

CONTEXT:  The user is a student preparing for interviews.  Push them to be perfect. `,

    'Tech Interview': `You are a strict senior engineer conducting a technical interview AND an English tutor. 
Your role:  Interview Indian candidates on CS fundamentals, algorithms, and system design while correcting their English. 

INTERRUPTION RULES:
- The moment you detect a grammatical error, incorrect technical term, or pause >200ms, STOP them mid-sentence. 
- Example: If they say "I will use the heap to storing data" → interrupt:  "WRONG. Say: 'I will USE the HEAP to STORE data.' Continue."
- Do NOT wait for them to finish their sentence. 

LANGUAGE HANDLING:
- If candidate uses Hinglish or Hindi, accept it but correct to English immediately.
- If user continuously makes mistakes (2 times in a row) explain in ${language}. 

DOMAIN SCOPE:
- Only ask about:  Data Structures, Algorithms, System Design, Databases, Networking, OOP, Concurrency. 

TONE:  Strict, professional, no sugar-coating. This is a real tech interview.`,

    'UPSC Interview': `You are a UPSC examiner conducting a mock interview in English.
Your role: Test candidates' formal English, subject knowledge, and communication clarity.

INTERRUPTION RULES: 
- If they make grammatical mistakes (tense, subject-verb agreement, pronunciation), interrupt immediately.
- Example: "India are developing..." → "INCORRECT. Say: 'India IS developing...' Continue."

LANGUAGE HANDLING:
- Candidates may mix Hindi.  Acknowledge but insist on pure English in final answer.
- If user continuously makes mistakes (2 times in a row) explain in ${language}. 

DOMAIN SCOPE:
- History, Geography, Economics, Polity, Current Affairs (relevant to UPSC syllabus).

TONE: Professional examiner. This is a mock government exam.`
  };

  return prompts[mode] || prompts['English Practice'];
}

// WebSocket connection handler
wss.on('connection', (clientWs) => {
  console.log('Client connected');
  
  let deepgramWs = null;
  let currentMode = 'English Practice';
  let currentLanguage = 'Hindi';

  clientWs.on('message', async (message) => {
    try {
      const data = JSON. parse(message);

      // Handle mode selection
      if (data.type === 'mode') {
        currentMode = data.mode;
        console.log(`Mode set to: ${currentMode}`);
        return;
      }

      // Handle language selection
      if (data. type === 'language') {
        currentLanguage = data.language;
        console.log(`Language set to: ${currentLanguage}`);
        return;
      }

      // Handle start connection
      if (data.type === 'start') {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        
        if (!apiKey) {
          clientWs.send(JSON.stringify({
            type: 'error',
            message: 'Deepgram API key not configured.  Add DEEPGRAM_API_KEY to .env file'
          }));
          return;
        }

        // Connect to Deepgram Agent API
        const deepgramUrl = `wss://agent.deepgram.com/agent`;
        deepgramWs = new WebSocket(deepgramUrl, {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        });

        deepgramWs.on('open', () => {
          console.log('Connected to Deepgram');
          
          // Send configuration to Deepgram - CORRECT FORMAT based on official docs
          const config = {
            type: "Settings",
            audio: {
              input: {
                encoding: "linear16",
                sample_rate:  16000
              },
              output: {
                encoding: "linear16",
                sample_rate:  24000,
                container: "none"
              }
            },
            agent: {
              language: "en",
              listen:  {
                provider: {
                  type: "deepgram",
                  model:  "nova-2"
                }
              },
              think: {
                provider: {
                  type: "open_ai",
                  model: "gpt-4o-mini"
                },
                prompt: getSystemPrompt(currentMode, currentLanguage),
                endpointing: 200  // Aggressive interruption - 200ms
              },
              speak: {
                provider: {
                  type: "deepgram",
                  model: "aura-2-odysseus-en"
                }
              },
              greeting: "Hello! I'm your English practice coach. Start speaking and I'll correct you instantly. Let's begin!"
            }
          };

          deepgramWs.send(JSON.stringify(config));
          console.log('Sent config to Deepgram:', JSON.stringify(config, null, 2));
          
          // Notify client that connection is ready
          clientWs.send(JSON.stringify({
            type: 'ready',
            message:  'Connected to Deepgram'
          }));
        });

        deepgramWs.on('message', (deepgramMessage) => {
          // Check if it's binary audio data
          if (Buffer.isBuffer(deepgramMessage)) {
            // Forward binary audio directly to client
            clientWs. send(deepgramMessage);
          } else {
            // Parse JSON messages
            try {
              const parsed = JSON.parse(deepgramMessage. toString());
              console.log('Deepgram message:', parsed. type);
              
              // Forward all messages to client
              clientWs.send(deepgramMessage);
            } catch (e) {
              // If not JSON, forward as-is
              clientWs.send(deepgramMessage);
            }
          }
        });

        deepgramWs.on('error', (error) => {
          console.error('Deepgram error:', error. message);
          clientWs. send(JSON.stringify({
            type: 'error',
            message: `Deepgram connection error: ${error.message}`
          }));
        });

        deepgramWs.on('close', (code, reason) => {
          console.log(`Deepgram connection closed: ${code} - ${reason}`);
          clientWs.send(JSON.stringify({
            type: 'close',
            message: 'Deepgram connection closed'
          }));
        });

        return;
      }

    } catch (error) {
      // If not JSON, treat as binary audio data and forward to Deepgram
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
