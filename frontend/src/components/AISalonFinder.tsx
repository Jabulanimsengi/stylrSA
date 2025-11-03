'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaRobot, FaTimes, FaMinus, FaPaperPlane, FaExpand } from 'react-icons/fa';
import styles from './AISalonFinder.module.css';
import { parseUserInput, getQuickActions, ChatIntent } from '@/lib/chatIntent';
import { FilterValues } from './FilterBar/FilterBar';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  quickActions?: string[];
  filters?: Partial<FilterValues>;
}

export default function AISalonFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initial greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeIntent = parseUserInput('hello');
      addBotMessage(welcomeIntent);
    }
  }, [isOpen]);

  const addBotMessage = (intent: ChatIntent) => {
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: intent.response,
      quickActions: intent.quickActions,
      filters: intent.filters
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Show typing indicator
    setIsTyping(true);
    setTimeout(() => {
      // Parse intent
      const intent = parseUserInput(text);
      
      // Add bot response
      addBotMessage(intent);
      
      // If we have filters, offer to show results
      if (intent.filters && Object.values(intent.filters).some(v => v && v !== '')) {
        setTimeout(() => {
          const resultsMessage: Message = {
            id: `bot-${Date.now()}-results`,
            type: 'bot',
            content: '📋 Ready to see results?',
            quickActions: ['Show me salons', 'Refine search more']
          };
          setMessages(prev => [...prev, resultsMessage]);
        }, 500);
      }
      
      setIsTyping(false);
    }, 800); // Simulate thinking time
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleShowResults = (filters?: Partial<FilterValues>) => {
    if (!filters) return;

    // Build search URL based on filters
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.province) params.append('province', filters.province);
    if (filters.service) params.append('service', filters.service);
    if (filters.category) params.append('category', filters.category);
    if (filters.priceMin) params.append('priceMin', filters.priceMin);
    if (filters.priceMax) params.append('priceMax', filters.priceMax);
    if (filters.openNow) params.append('openNow', 'true');
    if (filters.offersMobile) params.append('offersMobile', 'true');

    // Navigate to salons page with filters
    const searchUrl = `/salons?${params.toString()}`;
    router.push(searchUrl);
    
    // Close chat
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  if (!isOpen) {
    return (
      <button
        className={styles.launcher}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Salon Finder"
      >
        <FaRobot className={styles.launcherIcon} />
        <span className={styles.launcherText}>Find Salons</span>
      </button>
    );
  }

  return (
    <div className={`${styles.container} ${isMinimized ? styles.minimized : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FaRobot className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>AI Salon Finder</div>
            <div className={styles.headerSubtitle}>Your personal beauty assistant</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.headerButton}
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <FaExpand /> : <FaMinus />}
          </button>
          <button
            className={styles.headerButton}
            onClick={() => {
              setIsOpen(false);
              setMessages([]);
            }}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className={styles.messages}>
            {messages.map((message) => (
              <div key={message.id} className={styles.messageWrapper}>
                <div className={`${styles.message} ${styles[message.type]}`}>
                  <div className={styles.messageContent}>
                    {message.content.split('\\n').map((line, i) => (
                      <p key={i} className={styles.messageLine}>{line}</p>
                    ))}
                  </div>
                  
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className={styles.quickActions}>
                      {message.quickActions.map((action, index) => (
                        <button
                          key={index}
                          className={styles.quickActionButton}
                          onClick={() => {
                            if (action.toLowerCase() === 'show me salons') {
                              handleShowResults(message.filters);
                            } else {
                              handleQuickAction(action);
                            }
                          }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className={styles.messageWrapper}>
                <div className={`${styles.message} ${styles.bot}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputContainer} onSubmit={handleFormSubmit}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Try: 'braiding salons near me' or 'nail salons in Sandton'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>

          {/* Suggested starter queries */}
          {messages.length === 1 && (
            <div className={styles.starterSuggestions}>
              <div className={styles.suggestionsLabel}>Popular searches:</div>
              <div className={styles.suggestionChips}>
                {['Hair salons near me', 'Nail salons Johannesburg', 'Spas open now', 'Affordable braiding'].map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionChip}
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
