# Vartalaap AI - Real-time English Practice with Instant Corrections

A real-time English practice application using Deepgram Voice Agent API that **interrupts and corrects you instantly** while you speak - perfect for Indian students preparing for interviews and improving English fluency.

## 🎯 Problem Statement

Most Indian students can understand and write English but struggle to speak fluently. Existing solutions like ChatGPT or Gemini:
- Wait for you to complete sentences before responding
- Don't interrupt mid-sentence to correct mistakes
- Don't explain corrections in your native language
- Lack real-time feedback for natural conversation practice

**Vartalaap AI solves this** by providing aggressive real-time corrections in your native language while you practice English.

## ✨ Key Features

### **Instant Correction System**
- **200ms interruption** - AI stops you mid-sentence when you make mistakes
- **Bilingual explanations** - Corrections explained in Hindi, Tamil, Telugu, Marathi, Punjabi, Bengali, Gujarati, Kannada, Malayalam
- **Grammar & pronunciation** - Catches tense errors, subject-verb agreement, wrong word choice
- **Natural flow** - After correction, conversation continues smoothly

### **Multiple Practice Modes**

1. **English Practice (Beginner)** - Focus purely on speaking English correctly with instant feedback
2. **Technical Interview** - Practice DSA, System Design, Projects while getting English corrections
3. **UPSC Interview** - Prepare for civil services with questions on current affairs, polity, economy
4. **SSC/Railway/Banking** - Government job interview preparation with confidence building
5. **Finance Interview** - Banking and finance concepts with professional English
6. **Business/MBA Interview** - Corporate interview prep with business case discussions

### **Multi-language Support**
- Choose your native language for corrections
- Supported: Hindi, Tamil, Telugu, Marathi, Punjabi, Bengali, Gujarati, Kannada, Malayalam
- AI explains mistakes in your language for better understanding

### **Real-time Audio-to-Audio**
- Powered by Deepgram Voice Agent API
- Ultra-low latency (200-500ms total)
- Natural conversation flow with interruption capability
- No text parsing delays

## 🚀 How It Works

```
You: "I was went to market yesterday..."
AI: "Wait! You said 'was went'. Correct: 'I went' or 'I was going'. 
     Hindi में: 'was' aur 'went' ek saath nahi aate. Continue!"
You: "I went to market yesterday to buy vegetables..."
AI: "Great! What did you buy?"
```

## 🛠️ Technical Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript with Web Audio API
- **Backend**: Node.js + Express + WebSocket (ws)
- **AI Service**: Deepgram Voice Agent API
  - STT: Nova-2 (Speech-to-Text)
  - LLM: GPT-4o (Conversation & Correction Logic)
  - TTS: Aura-Asteria (Text-to-Speech)
- **Audio**: 16kHz Linear16 encoding
- **Endpointing**: 200ms (aggressive interruption)

## 📋 Prerequisites

- Node.js (v14 or higher)
- Deepgram API key ([Get one here](https://deepgram.com))

## 🔧 Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yuvraj707sharma/Vartalaap-AI.git
   cd Vartalaap-AI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   copy .env.example .env
   ```

4. Add your Deepgram API key to `.env`:
   ```
   DEEPGRAM_API_KEY=your_actual_api_key_here
   ```

## 🎮 Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open browser:
   ```
   http://localhost:3000
   ```

3. Select:
   - Your practice mode (English Practice, Tech Interview, etc.)
   - Your native language (for corrections)

4. Click "Start Practice" and allow microphone access

5. Start speaking in English - AI will interrupt and correct you instantly!

## 💡 Use Cases

### For Students
- Practice English speaking before college interviews
- Prepare for competitive exams (UPSC, SSC, Banking)
- Build confidence in spoken English
- Learn correct grammar through real-time feedback

### For Job Seekers
- Technical interview preparation (IT/Software jobs)
- Finance/Banking interview practice
- Business/MBA interview prep
- Government job interview preparation

### For Language Learners
- Improve English fluency
- Get corrections in your native language
- Practice without fear of judgment
- Build natural conversation skills

## 🎯 Why Deepgram Agent API?

**Latency Comparison:**

| Approach | Latency | Interruption |
|----------|---------|-------------|
| Traditional (STT → LLM → TTS) | 2-3 seconds | ❌ Too slow |
| Deepgram Agent API | 200-500ms | ✅ Natural |

**For real-time interruption and correction, Deepgram Agent API is the only viable solution.**

## 📁 Project Structure

```
Vartalaap-AI/
├── server.js           # WebSocket proxy server with correction prompts
├── index.html          # Frontend UI with audio processing
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md          # Documentation
```

## 🔒 Security Note

**For production deployment:**
- Add session time limits
- Implement rate limiting
- Add authentication
- Use environment-based configuration
- Monitor API usage

## 🤝 Contributing

Contributions welcome! This project is designed for hackathons and educational purposes.

## 📄 License

MIT

## 🙏 Acknowledgments

- Deepgram for Voice Agent API
- OpenAI for GPT-4o
- Indian language communities for inspiration

---

**Built for Indian students, by Indian developers. Practice English confidently! 🇮🇳**
