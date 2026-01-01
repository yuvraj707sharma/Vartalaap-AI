# Vartalaap AI - Real-time Language Practice App

A real-time language practice application using Deepgram Voice Agent API for interactive conversations.

## Features

- **Multiple Practice Modes:**
  - **General Conversation**: Practice casual conversations in a friendly environment
  - **Technical Interview**: Prepare for tech interviews with questions on programming and system design
  - **UPSC Interview**: Practice for UPSC interviews with questions on current affairs and general knowledge

- **Real-time Voice Interaction**: Powered by Deepgram's Voice Agent API
- **Aggressive Interruption Handling**: 200ms endpointing for natural conversation flow
- **WebSocket-based Communication**: Low-latency audio streaming

## Prerequisites

- Node.js (v14 or higher)
- Deepgram API key ([Get one here](https://deepgram.com))

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yuvraj707sharma/Vartalaap-AI.git
   cd Vartalaap-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Deepgram API key to the `.env` file:
   ```
   DEEPGRAM_API_KEY=your_actual_api_key_here
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Select your practice mode from the dropdown

4. Click "Start Practice" and allow microphone access

5. Start speaking to practice your conversation skills!

## Architecture

### Backend (`server.js`)
- WebSocket server listening on port 3000
- Proxies connections between frontend and Deepgram Agent API
- Implements `getSystemPrompt(mode)` for different practice modes
- Configures endpointing at 200ms for aggressive interruption

### Frontend (`index.html`)
- Dropdown UI for mode selection (Tech, UPSC, General)
- Microphone access via `navigator.mediaDevices.getUserMedia()`
- Real-time audio streaming to backend
- Audio playback for AI responses

### Dependencies (`package.json`)
- `ws`: WebSocket server implementation
- `dotenv`: Environment variable management
- `express`: HTTP server for serving static files

## Technical Details

- Audio format: Linear16, 16kHz sample rate
- Endpointing: 200ms (aggressive interruption)
- AI Model: GPT-4o for conversation
- Speech-to-Text: Deepgram Nova-2
- Text-to-Speech: Deepgram Aura-Asteria

## License

MIT
