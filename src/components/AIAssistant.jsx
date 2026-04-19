import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './AIAssistant.css';

export default function AIAssistant({ contextData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am VenueIQ Assistant. Ask me about queues, crowds, or alerts.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        throw new Error('Gemini API key is missing or invalid.');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `You are the AI Assistant for VenueIQ, a smart stadium app. Be concise and helpful. 
      Here is the current live data for the venue: 
      Queues: ${JSON.stringify(contextData.queues)}
      Crowd Densities: ${JSON.stringify(contextData.densities)}
      Active Alerts: ${JSON.stringify(contextData.alerts)}
      
      User question: ${userText}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that. Please check your Gemini API key in .env." }]);
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
            <button onClick={() => setIsOpen(false)} aria-label="Close chat" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
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
            />
            <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </aside>
      )}
      
      {!isOpen && (
        <button 
          className="ai-toggle-btn" 
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}

AIAssistant.propTypes = {
  contextData: PropTypes.shape({
    queues: PropTypes.array,
    densities: PropTypes.object,
    alerts: PropTypes.array
  }).isRequired
};
