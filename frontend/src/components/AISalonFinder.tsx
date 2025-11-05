'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaRobot, FaTimes, FaMinus, FaPaperPlane, FaExpand, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './AISalonFinder.module.css';
import { parseUserInput, getQuickActions, ChatIntent } from '@/lib/chatIntent';
import { FilterValues } from './FilterBar/FilterBar';

interface Salon {
  id: string;
  name: string;
  city: string;
  province: string;
  avgRating?: number;
  reviews?: any[];
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'salons';
  content: string;
  quickActions?: string[];
  filters?: Partial<FilterValues>;
  salons?: Salon[];
  isLoading?: boolean;
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

  const fetchSalons = async (filters: Partial<FilterValues>) => {
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.province) params.append('province', filters.province);
    if (filters.service) params.append('service', filters.service);
    if (filters.category) params.append('category', filters.category);
    if (filters.priceMin) params.append('priceMin', filters.priceMin);
    if (filters.priceMax) params.append('priceMax', filters.priceMax);
    if (filters.openNow) params.append('openNow', 'true');
    if (filters.offersMobile) params.append('offersMobile', 'true');

    try {
      const response = await fetch(`/api/salons/approved?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch salons');
      const salons = await response.json();
      return salons;
    } catch (error) {
      console.error('Error fetching salons:', error);
      return [];
    }
  };

  const handleSendMessage = async (text: string) => {
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
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Parse intent
    const intent = parseUserInput(text);
    
    // Add bot response
    addBotMessage(intent);
    setIsTyping(false);
    
    // If we have filters, fetch and show salons
    if (intent.filters && Object.values(intent.filters).some(v => v && v !== '')) {
      // Add loading message
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        type: 'salons',
        content: '',
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMessage]);
      
      // Fetch salons
      const salons = await fetchSalons(intent.filters);
      
      // Remove loading message and add results
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));
      
      if (salons.length > 0) {
        const salonMessage: Message = {
          id: `salons-${Date.now()}`,
          type: 'salons',
          content: `Found ${salons.length} salon${salons.length > 1 ? 's' : ''} for you! 🎉`,
          salons: salons.slice(0, 3), // Show top 3
          filters: intent.filters
        };
        setMessages(prev => [...prev, salonMessage]);
      } else {
        const noResultsMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: "No salons found matching your criteria. Try broadening your search or removing some filters.",
          quickActions: ['Try different location', 'Show all salons']
        };
        setMessages(prev => [...prev, noResultsMessage]);
      }
    }
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
        aria-label="Open AI Assistant"
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
            <div className={styles.headerTitle}>AI Assistant</div>
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
                {message.type === 'salons' ? (
                  // Salon results display
                  <div className={`${styles.message} ${styles.bot}`}>
                    {message.isLoading ? (
                      <div className={styles.loadingResults}>
                        🔍 Finding salons for you...
                      </div>
                    ) : (
                      <>
                        <div className={styles.messageContent}>
                          {message.content}
                        </div>
                        {message.salons && message.salons.length > 0 && (
                          <div className={styles.salonResults}>
                            {message.salons.map((salon) => (
                              <Link
                                key={salon.id}
                                href={`/salons/${salon.id}`}
                                className={styles.salonCard}
                                onClick={() => setIsOpen(false)}
                              >
                                <div className={styles.salonCardHeader}>
                                  <h4 className={styles.salonCardName}>{salon.name}</h4>
                                  {salon.avgRating && (
                                    <div className={styles.salonCardRating}>
                                      <FaStar /> {salon.avgRating.toFixed(1)}
                                    </div>
                                  )}
                                </div>
                                <div className={styles.salonCardLocation}>
                                  <FaMapMarkerAlt />
                                  {salon.city}, {salon.province}
                                </div>
                                {salon.reviews && salon.reviews.length > 0 && (
                                  <div className={styles.salonCardServices}>
                                    {salon.reviews.length} review{salon.reviews.length > 1 ? 's' : ''}
                                  </div>
                                )}
                              </Link>
                            ))}
                            {message.filters && (
                              <button
                                className={styles.viewAllButton}
                                onClick={() => handleShowResults(message.filters)}
                              >
                                View All Results →
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // Regular text message
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
                )}
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
