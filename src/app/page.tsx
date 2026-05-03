'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User } from 'lucide-react';
import styles from './page.module.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hello! I am your AI Election Assistant. I can help you understand the election process, voting timelines, registration steps, and more. How can I assist you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={`animate-fade-in ${styles.header}`}>
        <h1 className={`${styles.title} gradient-text`}>Election Assistant</h1>
        <p className={styles.subtitle}>
          Your smart guide to understanding the election process, voting timelines, and civic duties.
        </p>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.chatContainer}`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.messageArea}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {msg.role === 'user' ? <User size={20} className="text-indigo-300" /> : <Bot size={20} className="text-purple-300" />}
                </div>
                <div className={styles.markdown}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-purple-300" />
                <div className={styles.loadingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          {messages.length === 1 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {['How do I register to vote?', 'What are the deadlines for the next election?', 'Explain the electoral college.'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 text-slate-200 px-4 py-2 rounded-full text-sm transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about voter registration, election dates..."
              className={styles.input}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtn}`}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
