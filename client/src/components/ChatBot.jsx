import { useState } from 'react';
import './ChatBot.css';

// In development, Vite's proxy forwards /api → localhost:5000.
// In production, VITE_API_URL must point to the backend (e.g. https://famtree-backend.onrender.com).
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/ai/chat`;

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[ChatBot] VITE_API_URL is not set. API calls will target the current origin, which will fail on a static frontend host like Vercel.'
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: crypto.randomUUID(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      // Guard against non-JSON responses (e.g. HTML fallback from Vercel)
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const aiMsg = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: data.reply || data.error || 'No response.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'ai', text: 'Failed to reach the server.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      {/* Floating toggle button */}
      <button className="chatbot-fab" onClick={() => setIsOpen((o) => !o)}>
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">FamTree AI Chat</div>

          <div className="chatbot-body">
            {messages.length === 0 && (
              <p className="chatbot-placeholder">Ask me anything about your family tree!</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-bubble ${msg.role === 'user' ? 'chatbot-bubble--user' : 'chatbot-bubble--ai'}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="chatbot-bubble chatbot-bubble--ai">Thinking…</div>}
          </div>

          <div className="chatbot-footer">
            <input
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
            />
            <button className="chatbot-send-btn" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
