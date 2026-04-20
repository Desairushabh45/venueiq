import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import DOMPurify from 'dompurify';
import { logEvent } from '../firebase';
import './AIAssistant.css';

// ── Fallback: rule-based local responses when Gemini is unavailable ────────────
function buildFallbackResponse(userText, { queues, densities, alerts }) {
  const q = userText.toLowerCase();

  // Alert queries
  if (q.includes('alert') || q.includes('emergency') || q.includes('incident')) {
    if (!alerts || alerts.length === 0) return 'All clear — no active alerts at the moment.';
    const top = alerts.slice(0, 2);
    return top
      .map((a) => `🚨 ${a.title}: ${a.message}`)
      .join('\n');
  }

  // Gate queries — "which gate is fastest?" etc.
  if (q.includes('gate') || q.includes('entry') || q.includes('entrance') || q.includes('exit') || q.includes('fastest')) {
    const gates = queues ? queues.filter((item) => item.type === 'gate') : [];
    if (gates.length === 0) return 'No gate data available.';
    const sorted = [...gates].sort((a, b) => a.waitTime - b.waitTime);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];
    return `✅ Fastest gate: ${fastest.name} — ${fastest.waitTime} min wait.\n` +
      `⚠️ Avoid: ${slowest.name} — ${slowest.waitTime} min wait.`;
  }

  // Named queue lookup — "south bar", "east toilets", etc.
  const queueMatch = queues && queues.find((item) => {
    const nameLower = item.name.toLowerCase();
    return q.includes(nameLower) || nameLower.split(' ').some((w) => w.length > 3 && q.includes(w));
  });
  if (queueMatch) {
    const status = queueMatch.waitTime < 10 ? '✅ Low' : queueMatch.waitTime < 20 ? '⚠️ Moderate' : '🔴 High';
    return `${queueMatch.name}: ${queueMatch.waitTime} min wait (${status}). ${
      queueMatch.waitTime > 15 ? 'Consider an alternative.' : 'Good time to go!'
    }`;
  }

  // General queue / wait queries
  if (q.includes('queue') || q.includes('wait') || q.includes('line')) {
    if (!queues || queues.length === 0) return 'No queue data available right now.';
    const sorted = [...queues].sort((a, b) => a.waitTime - b.waitTime);
    return `Shortest wait: ${sorted[0].name} (${sorted[0].waitTime} min).\nLongest wait: ${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].waitTime} min).`;
  }

  // Stand density — "how busy is north stand?"
  const standNames = ['north', 'south', 'east', 'west'];
  const standMatch = standNames.find((s) => q.includes(s));
  if (standMatch && densities) {
    const pct = densities[standMatch];
    if (pct !== undefined) {
      const level = pct >= 70 ? '🔴 High' : pct >= 40 ? '⚠️ Moderate' : '✅ Low';
      return `${standMatch.charAt(0).toUpperCase() + standMatch.slice(1)} Stand: ${pct}% capacity (${level}).${
        pct >= 70 ? ' Try a less crowded area.' : ' Good space available.'
      }`;
    }
  }

  // General crowd / density / busy queries
  if (q.includes('crowd') || q.includes('busy') || q.includes('density') || q.includes('full')) {
    if (!densities) return 'No crowd density data available.';
    const entries = Object.entries(densities).sort((a, b) => b[1] - a[1]);
    const [mostName, mostPct] = entries[0];
    const [leastName, leastPct] = entries[entries.length - 1];
    return `Most crowded: ${mostName} Stand (${mostPct}%).\nLeast crowded: ${leastName} Stand (${leastPct}%) — head there for more space!`;
  }

  // Food queries
  if (q.includes('food') || q.includes('drink') || q.includes('bar') || q.includes('stall') || q.includes('eat')) {
    const food = queues ? queues.filter((item) => item.type === 'food') : [];
    if (food.length === 0) return 'No food stall data available.';
    const fastest = [...food].sort((a, b) => a.waitTime - b.waitTime)[0];
    return `🍔 Quickest food: ${fastest.name} — ${fastest.waitTime} min wait.`;
  }

  // Toilet queries
  if (q.includes('toilet') || q.includes('restroom') || q.includes('bathroom') || q.includes('loo')) {
    const toilets = queues ? queues.filter((item) => item.type === 'toilet') : [];
    if (toilets.length === 0) return 'No restroom data available.';
    const fastest = [...toilets].sort((a, b) => a.waitTime - b.waitTime)[0];
    return `🚻 Nearest restroom: ${fastest.name} — ${fastest.waitTime} min wait.`;
  }

  // Default help message
  return 'I can help with:\n• "Which gate is fastest?"\n• "How busy is the North Stand?"\n• "Show alerts"\n• "Food stall wait times"';
}

// ── Component ──────────────────────────────────────────────────────────────────
const AIAssistant = React.memo(({ contextData, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am VenueIQ Assistant. Ask me about queues, crowds, or alerts.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleOpen = useCallback(() => {
    if (!isOpen) {
      logEvent('ai_assistant_opened');
      if (typeof onOpen === 'function') onOpen();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, onOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // ── API Key Validation ───────────────────────────────────────────────
      if (!apiKey || apiKey === 'your_gemini_api_key') {
        const fallback = buildFallbackResponse(userText, contextData);
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: `${fallback}\n\n_[AI key not configured — live data fallback]_` },
        ]);
        return;
      }
      
      if (!apiKey.startsWith('AIza')) {
        throw Object.assign(new Error('Invalid Gemini API Key format'), { status: 401, isFormatError: true });
      }

      // ── Rate Limiting (10 requests per minute per session) ──────────────
      const now = Date.now();
      const sessionRequests = JSON.parse(sessionStorage.getItem('venueiq_ai_requests') || '[]');
      const recentRequests = sessionRequests.filter(time => now - time < 60000);
      
      if (recentRequests.length >= 10) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Too many requests. Please wait a moment.' }]);
        setIsLoading(false);
        return;
      }
      
      recentRequests.push(now);
      sessionStorage.setItem('venueiq_ai_requests', JSON.stringify(recentRequests));

      // ── Input Sanitization and Script Injection Prevention ────────────────
      if (userText.length > 200) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Input exceeds 200 characters limit.' }]);
        setIsLoading(false);
        return;
      }

      const sanitizedText = DOMPurify.sanitize(userText);
      if (sanitizedText !== userText && (userText.includes('<script>') || userText.includes('javascript:'))) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Blocked malicious input.' }]);
        setIsLoading(false);
        return;
      }

      // Build the full prompt with live data context
      const fullPrompt = `You are VenueIQ Assistant — a concise, action-oriented stadium AI.
Answer in 1-2 sentences max. Use the live data below.

Live Queues: ${JSON.stringify(contextData.queues)}
Crowd Densities (% capacity): ${JSON.stringify(contextData.densities)}
Active Alerts: ${JSON.stringify(contextData.alerts)}

User: ${userText}`;

      // ── Direct fetch to Gemini REST API ───────────────────────────────────
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 150,
            },
          }),
        }
      );

      // ── Detailed error logging ─────────────────────────────────────────────
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error('[VenueIQ Gemini] HTTP', response.status, JSON.stringify(errBody));
        throw Object.assign(new Error(`HTTP ${response.status}`), {
          status: response.status,
          body: errBody,
        });
      }

      const data = await response.json();
      console.log('[VenueIQ Gemini] Response:', JSON.stringify(data).slice(0, 200));

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('Empty response from Gemini');

      const sanitized = DOMPurify.sanitize(responseText);
      setMessages((prev) => [...prev, { role: 'ai', text: sanitized }]);

    } catch (error) {
      console.error('[VenueIQ Gemini] Full error:', error);

      // ── Classify error and give a useful fallback in every case ───────────
      const status = error?.status;
      const fallback = buildFallbackResponse(userText, contextData);

      let suffix;
      if (status === 429) {
        suffix = '_[⏳ Rate limit — live data fallback]_';
      } else if (status === 400) {
        suffix = '_[⚠️ Bad request — live data fallback]_';
      } else if (status === 403 || status === 401 || error?.message?.includes('API_KEY_INVALID')) {
        suffix = '_[🔑 API key issue — live data fallback]_';
      } else {
        suffix = '_[🔌 Network issue — live data fallback]_';
      }

      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: `${fallback}\n\n${suffix}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {isOpen && (
        <aside className="ai-chat-window" aria-label="Venue AI Assistant">
          <header className="ai-chat-header">
            <Bot size={20} className="text-accent" />
            Venue Assistant
            <button
              onClick={handleToggleOpen}
              aria-label="Close chat"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </header>
          <div className="ai-chat-messages" role="log" aria-live="polite">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="message ai">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form className="ai-chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the venue..."
              aria-label="Ask a question"
              maxLength={200}
            />
            <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </aside>
      )}

      {!isOpen && (
        <button
          id="ai-assistant-toggle"
          className="ai-toggle-btn"
          onClick={handleToggleOpen}
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
});

AIAssistant.propTypes = {
  contextData: PropTypes.shape({
    queues: PropTypes.array,
    densities: PropTypes.object,
    alerts: PropTypes.array,
  }).isRequired,
  onOpen: PropTypes.func,
};

AIAssistant.defaultProps = {
  onOpen: null,
};

AIAssistant.displayName = 'AIAssistant';

export default AIAssistant;
