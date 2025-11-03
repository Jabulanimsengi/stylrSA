'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaRobot, FaTimes, FaMinus, FaPaperPlane, FaExpand, FaStar, FaMapMarkerAlt, FaCalendar, FaImage, FaDollarSign } from 'react-icons/fa';
import styles from './AISalonFinder.module.css';
import { 
  parseEnhancedInput, 
  getSalonDetails, 
  getSalonServices, 
  getSalonGallery,
  getSalonReviews,
  formatSalonForChat,
  formatServicesForChat,
  getContextualActions
} from '@/lib/aiChatbotEnhanced';
import { parseUserInput } from '@/lib/chatIntent';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'salons' | 'services' | 'gallery' | 'reviews';
  content: string;
  quickActions?: string[];
  data?: any;
  isLoading?: boolean;
}

export default function EnhancedAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, authStatus } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initial greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeIntent = parseEnhancedInput('hello', { userId: user?.id });
      addBotMessage(welcomeIntent.response, welcomeIntent.quickActions);
    }
  }, [isOpen, user?.id]);

  const addBotMessage = (content: string, quickActions?: string[], data?: any, type: Message['type'] = 'bot') => {
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      type,
      content,
      quickActions,
      data
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleSalonSearch = async (userInput: string) => {
    // Use existing search functionality
    const intent = parseUserInput(userInput);
    
    if (intent.filters && Object.values(intent.filters).some(v => v && v !== '')) {
      const params = new URLSearchParams();
      
      if (intent.filters.city) params.append('city', intent.filters.city);
      if (intent.filters.province) params.append('province', intent.filters.province);
      if (intent.filters.service) params.append('service', intent.filters.service);
      if (intent.filters.category) params.append('category', intent.filters.category);
      if (intent.filters.priceMin) params.append('priceMin', intent.filters.priceMin);
      if (intent.filters.priceMax) params.append('priceMax', intent.filters.priceMax);
      if (intent.filters.openNow) params.append('openNow', 'true');
      if (intent.filters.offersMobile) params.append('offersMobile', 'true');

      try {
        const response = await fetch(`/api/salons/approved?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch salons');
        const salons = await response.json();
        
        if (salons.length > 0) {
          const salonMessage: Message = {
            id: `salons-${Date.now()}`,
            type: 'salons',
            content: `🎉 Found ${salons.length} salon${salons.length > 1 ? 's' : ''}! Click any salon to view full profile, services, prices, and gallery.`,
            data: salons.slice(0, 3),
            quickActions: ['View all results', 'Refine search']
          };
          setMessages(prev => [...prev, salonMessage]);
          return true;
        }
      } catch (error) {
        console.error('Error fetching salons:', error);
      }
    }
    return false;
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
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Parse with enhanced understanding
    const enhancedIntent = parseEnhancedInput(text, { 
      userId: user?.id,
      currentSalon: null 
    });
    
    // Add enhanced bot response
    addBotMessage(enhancedIntent.response, enhancedIntent.quickActions);
    setIsTyping(false);
    
    // Handle specific intents
    if (enhancedIntent.type === 'salon_info' || enhancedIntent.type === 'location_query') {
      // Try to search for salons
      const found = await handleSalonSearch(text);
      if (!found) {
        addBotMessage(
          "I couldn't find specific salons matching that query. Try refining your search or use one of the quick actions below.",
          ['Find salons near me', 'Browse all salons', 'Search by service']
        );
      }
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'View all results' || action === 'Browse all salons') {
      router.push('/salons');
      setIsOpen(false);
      return;
    }
    
    if (action === 'Book now' || action === 'Book an appointment') {
      if (!user) {
        addBotMessage(
          'Please log in to book an appointment. Would you like to find salons first?',
          ['Find salons', 'Login']
        );
        return;
      }
    }

    if (action === 'Login') {
      // Trigger auth modal (you'd need to implement this trigger)
      addBotMessage(
        'Please use the login button in the navigation menu to sign in.',
        ['Find salons instead']
      );
      return;
    }

    // Otherwise, treat as a new message
    handleSendMessage(action);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleSalonClick = (salonId: string) => {
    router.push(`/salons/${salonId}`);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        className={styles.launcher}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Beauty Assistant"
      >
        <FaRobot className={styles.launcherIcon} />
        <span className={styles.launcherText}>AI Assistant</span>
      </button>
    );
  }

  return (
    <div className={`${styles.container} ${isMinimized ? styles.minimized : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FaRobot className={styles.headerIcon} />
          <div>
            <div className={styles.headerTitle}>AI Beauty Assistant</div>
            <div className={styles.headerSubtitle}>Ask me anything about salons!</div>
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
                  // Salon results display with enhanced cards
                  <div className={`${styles.message} ${styles.bot}`}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.data && message.data.length > 0 && (
                      <div className={styles.salonResults}>
                        {message.data.map((salon: any) => (
                          <div
                            key={salon.id}
                            className={styles.salonCard}
                            onClick={() => handleSalonClick(salon.id)}
                            style={{ cursor: 'pointer' }}
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
                            <div className={styles.salonCardServices}>
                              {salon.services?.length || 0} services • 
                              {salon.reviews?.length || 0} reviews
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              marginTop: '8px',
                              fontSize: '12px',
                              color: 'var(--color-text-muted)'
                            }}>
                              <span>💇 Services</span>
                              <span>📸 Gallery</span>
                              <span>⭐ Reviews</span>
                              <span>📅 Book</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.quickActions && message.quickActions.length > 0 && (
                      <div className={styles.quickActions}>
                        {message.quickActions.map((action, index) => (
                          <button
                            key={index}
                            className={styles.quickActionButton}
                            onClick={() => handleQuickAction(action)}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular text message
                  <div className={`${styles.message} ${styles[message.type]}`}>
                    <div className={styles.messageContent}>
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className={styles.messageLine}>{line}</p>
                      ))}
                    </div>
                    
                    {message.quickActions && message.quickActions.length > 0 && (
                      <div className={styles.quickActions}>
                        {message.quickActions.map((action, index) => (
                          <button
                            key={index}
                            className={styles.quickActionButton}
                            onClick={() => handleQuickAction(action)}
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
              placeholder="Ask about salons, services, prices, or booking..."
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

          {/* Enhanced starter suggestions */}
          {messages.length === 1 && (
            <div className={styles.starterSuggestions}>
              <div className={styles.suggestionsLabel}>Try asking:</div>
              <div className={styles.suggestionChips}>
                {[
                  'Find salons near me',
                  'Show me prices',
                  'View salon galleries',
                  'Book an appointment'
                ].map((suggestion, index) => (
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
