'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Globe } from 'lucide-react';
import styles from './page.module.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translatedContent?: string;
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'de', label: 'Deutsch (German)' },
];

const SUGGESTED_PROMPTS = [
  'How do I register to vote?',
  'What are the deadlines for the next election?',
  'Explain the electoral college.',
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        'Hello! I am your AI Election Assistant. I can help you understand the election process, voting timelines, registration steps, and more. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Re-translate all assistant messages when language changes
  useEffect(() => {
    if (targetLanguage === 'en') {
      // Clear translations — show original content
      setMessages((prev) =>
        prev.map((m) => ({ ...m, translatedContent: undefined }))
      );
      return;
    }

    const translateAll = async () => {
      const updated = await Promise.all(
        messages.map(async (msg) => {
          if (msg.role !== 'assistant') return msg;
          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: msg.content, targetLanguage }),
            });
            const data = await res.json();
            return { ...msg, translatedContent: data.translatedText };
          } catch {
            return msg;
          }
        })
      );
      setMessages(updated);
    };

    translateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLanguage]);

  const translateMessage = async (text: string): Promise<string> => {
    if (targetLanguage === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      });
      const data = await res.json();
      return data.translatedText ?? text;
    } catch {
      return text;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      const translatedContent = await translateMessage(data.message);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        translatedContent: targetLanguage !== 'en' ? translatedContent : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error while processing your request. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLang = LANGUAGES.find((l) => l.code === targetLanguage);

  return (
    <main className={styles.main}>
      <div className={`animate-fade-in ${styles.header}`}>
        <h1 className={`${styles.title} gradient-text`}>Election Assistant</h1>
        <p className={styles.subtitle}>
          Your smart guide to understanding the election process, voting timelines, and civic duties.
        </p>
      </div>

      {/* Language Selector */}
      <div className={styles.langSelectorWrapper}>
        <button
          className={styles.langButton}
          onClick={() => setShowLangMenu((v) => !v)}
          aria-label="Select language"
          aria-expanded={showLangMenu}
          id="lang-selector-btn"
        >
          <Globe size={16} />
          <span>{selectedLang?.label ?? 'English'}</span>
        </button>
        {showLangMenu && (
          <div className={styles.langDropdown} role="listbox" aria-label="Language options">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={targetLanguage === lang.code}
                className={`${styles.langOption} ${
                  targetLanguage === lang.code ? styles.langOptionActive : ''
                }`}
                onClick={() => {
                  setTargetLanguage(lang.code);
                  setShowLangMenu(false);
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`glass-panel animate-fade-in ${styles.chatContainer}`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className={styles.messageArea}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.role === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {msg.role === 'user' ? (
                    <User size={20} className="text-indigo-300" />
                  ) : (
                    <Bot size={20} className="text-purple-300" />
                  )}
                </div>
                <div className={styles.markdown}>
                  <ReactMarkdown>
                    {msg.translatedContent ?? msg.content}
                  </ReactMarkdown>
                  {msg.translatedContent && (
                    <p className={styles.originalText}>
                      <em>Original: {msg.content.substring(0, 80)}{msg.content.length > 80 ? '…' : ''}</em>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-purple-300" />
                <div className={styles.loadingIndicator} data-testid="loading-indicator">
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
              {SUGGESTED_PROMPTS.map((prompt) => (
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
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about voter registration, election dates..."
              className={styles.input}
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              id="chat-submit"
              type="submit"
              className={`btn-primary ${styles.submitBtn}`}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
