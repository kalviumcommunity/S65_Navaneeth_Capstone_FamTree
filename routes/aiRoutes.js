// routes/aiRoutes.js - AI Chatbot route using Groq API (free tier)

const express = require('express');
const axios = require('axios');
const router = express.Router();

// ── Simple in-memory rate limiter ───────────────────────────
// Prevents unauthenticated abuse / cost run-up on the Groq API.
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // per IP
const ipHits = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const record = ipHits.get(ip) || { count: 0, start: now };

  if (now - record.start > RATE_WINDOW_MS) {
    // Window expired – reset
    record.count = 1;
    record.start = now;
  } else {
    record.count += 1;
  }

  ipHits.set(ip, record);

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  next();
}

// System prompt – no leading/trailing whitespace so the model gets a clean input
const systemPrompt =
  'You are an AI assistant for FamTree, a family tree visualization platform. ' +
  'Answer questions related to: adding family members, understanding parent-child ' +
  'relationships, and how to use the platform. Keep answers short and helpful.';

// AI model – configurable via environment variable
const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

// POST /api/ai/chat
// Accepts: { message: "your question here" }
// Returns: { reply: "AI response here" }
router.post('/chat', rateLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    // Validate that a message was provided
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Get the API key from environment variables
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key is not configured.' });
    }

    // Groq API endpoint (OpenAI-compatible format)
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    // Send the user's message to Groq with a system prompt for context
    const response = await axios.post(
      url,
      {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the reply text from the Groq response
    const reply =
      response.data?.choices?.[0]?.message?.content ||
      'No response from AI.';

    return res.json({ reply });
  } catch (error) {
    // Log the full error details to the terminal for debugging
    console.error('AI Chat Error:', error.response?.data || error.message);
    const detail = error.response?.data?.error?.message || 'Failed to get a response from AI.';
    return res.status(500).json({ error: detail });
  }
});

module.exports = router;
