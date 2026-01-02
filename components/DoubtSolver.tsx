import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, ExternalLink, Loader2 } from 'lucide-react';
import { Message, Sender } from '../types';
import { askPhysicsDoubt } from '../services/geminiService';

export const DoubtSolver: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Stuck on a problem? Ask me anything about Physics. I'll search the web for quick formulas and concepts.",
      sender: Sender.AI,
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { text, sources } = await askPhysicsDoubt(userMsg.text, messages);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: Sender.AI,
        sources: sources,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sky-400">
          <Sparkles size={18} />
          <h2 className="font-semibold tracking-wide">Quick Doubts</h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">POWERED BY GEMINI</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === Sender.USER ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                msg.sender === Sender.USER
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}
            >
              {msg.text}
            </div>

            {/* Sources Display */}
            {msg.sender === Sender.AI && msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.sources.slice(0, 3).map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-1 rounded-md transition-colors"
                  >
                    <span>{source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}</span>
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            )}
            
            <span className="text-[10px] text-slate-600 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
           <div className="flex items-center gap-2 text-slate-500 text-sm p-2">
             <Loader2 className="animate-spin" size={16} />
             <span>Thinking...</span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="E.g., Formula for angular momentum?"
            className="w-full bg-slate-900 text-slate-200 placeholder-slate-600 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 disabled:hover:bg-sky-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          AI may make mistakes. Verify important concepts from textbooks.
        </p>
      </div>
    </div>
  );
};