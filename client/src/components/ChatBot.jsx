import { useState } from 'react';

// In development, VITE_API_URL is empty so Vite's proxy handles /api → localhost:5000
// In production (Vercel), VITE_API_URL = https://famtree-backend.onrender.com
const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/ai/chat`;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const aiMsg = { role: 'ai', text: data.reply || data.error || 'No response.' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Failed to reach the server.' }]);
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
      <button onClick={() => setIsOpen((o) => !o)} style={styles.fab}>
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
        <div style={styles.modal}>
          <div style={styles.header}>FamTree AI Chat</div>

          <div style={styles.body}>
            {messages.length === 0 && (
              <p style={styles.placeholder}>Ask me anything about your family tree!</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? '#4f46e5' : '#e5e7eb',
                  color: msg.role === 'user' ? '#fff' : '#111',
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ ...styles.bubble, alignSelf: 'flex-start', background: '#e5e7eb' }}>Thinking…</div>}
          </div>

          <div style={styles.footer}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
            />
            <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---- Inline styles ---- */
const styles = {
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff',
    fontSize: 24,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(79,70,229,.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  modal: {
    position: 'fixed',
    bottom: 96,
    right: 24,
    width: 400,
    height: 520,
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 8px 24px rgba(0,0,0,.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
  },
  header: {
    padding: '12px 16px',
    background: '#4f46e5',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
  },
  body: {
    flex: 1,
    padding: 12,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  placeholder: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
  bubble: {
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.45,
    wordBreak: 'break-word',
  },
  footer: {
    display: 'flex',
    borderTop: '1px solid #e5e7eb',
    padding: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    outline: 'none',
    fontSize: 14,
  },
  sendBtn: {
    padding: '8px 14px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};
