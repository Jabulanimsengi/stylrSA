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
  getContextualActions,
  getPromotions,
  getProducts,
  getTrends,
  searchServices,
  getFeaturedSalons,
  getFeaturedServices
} from '@/lib/aiChatbotEnhanced';
import { parseUserInput } from '@/lib/chatIntent';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'salons' | 'services' | 'gallery' | 'reviews' | 'promotions' | 'products' | 'trends';
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
    
    // Handle specific intents and fetch data
    if (enhancedIntent.type === 'salon_info' || enhancedIntent.type === 'location_query') {
      // Try to search for salons
      const found = await handleSalonSearch(text);
      if (!found) {
        addBotMessage(
          "I couldn't find specific salons matching that query. Try refining your search or use one of the quick actions below.",
          ['Find salons near me', 'Browse all salons', 'Search by service']
        );
      }
    } else if (enhancedIntent.type === 'service_query') {
      // Handle service queries
      await handleServiceQuery(text, enhancedIntent);
    } else if (enhancedIntent.actionType === 'view_promotions' || enhancedIntent.type === 'promotions_query') {
      // Handle promotions
      await handlePromotionsQuery();
    } else if (enhancedIntent.actionType === 'view_products' || enhancedIntent.type === 'products_query') {
      // Handle products
      await handleProductsQuery(text);
    } else if (enhancedIntent.actionType === 'view_trends' || enhancedIntent.type === 'trends_query') {
      // Handle trends
      await handleTrendsQuery(text);
    } else if (enhancedIntent.actionType === 'view_gallery' || enhancedIntent.type === 'images_gallery') {
      // Handle gallery requests
      await handleGalleryQuery(text);
    } else if (enhancedIntent.actionType === 'view_reviews' || enhancedIntent.type === 'reviews_query') {
      // Handle reviews requests
      await handleReviewsQuery(text);
    } else if (enhancedIntent.actionType === 'view_salon' || enhancedIntent.type === 'salon_profile') {
      // Handle specific salon profile requests
      await handleSalonProfileQuery(text);
    }
  };

  const handleServiceQuery = async (text: string, intent: any) => {
    try {
      setIsTyping(true);
      
      // Extract search terms from text
      const searchMatch = text.match(/(?:find|search|show|get|want|looking for|need)\s+(?:me\s+)?(?:a\s+)?(?:hair|nail|spa|beauty|service|services)?\s*:?\s*(.+)/i);
      const searchTerm = searchMatch ? searchMatch[1].trim() : '';
      
      // If it's a featured request
      if (/featured|popular|best|top/i.test(text)) {
        const featured = await getFeaturedServices();
        if (featured && featured.length > 0) {
          addBotMessage(
            `⭐ Found ${featured.length} featured service${featured.length > 1 ? 's' : ''}!`,
            ['View all services', 'Find salons'],
            featured.slice(0, 5),
            'services'
          );
        } else {
          addBotMessage(
            "I couldn't find featured services right now. Try searching for a specific service.",
            ['Search hair services', 'Search nail services', 'View all services']
          );
        }
      } else if (searchTerm) {
        // Search for services
        const services = await searchServices({ q: searchTerm });
        if (services && services.length > 0) {
          addBotMessage(
            `💇‍♀️ Found ${services.length} service${services.length > 1 ? 's' : ''} matching "${searchTerm}"!`,
            ['View all services', 'Find salons offering these'],
            services.slice(0, 5),
            'services'
          );
        } else {
          addBotMessage(
            `I couldn't find services matching "${searchTerm}". Try a different search term.`,
            ['View all services', 'Search hair services', 'Search nail services']
          );
        }
      } else {
        // General service query - show featured
        const featured = await getFeaturedServices();
        if (featured && featured.length > 0) {
          addBotMessage(
            `💇‍♀️ Here are some featured services:`,
            ['View all services', 'Search services', 'Find salons'],
            featured.slice(0, 5),
            'services'
          );
        }
      }
    } catch (error) {
      console.error('Error handling service query:', error);
      addBotMessage(
        "I had trouble fetching services. Please try again.",
        ['View all services', 'Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromotionsQuery = async () => {
    try {
      setIsTyping(true);
      const promotions = await getPromotions();
      if (promotions && promotions.length > 0) {
        addBotMessage(
          `🎉 Found ${promotions.length} active promotion${promotions.length > 1 ? 's' : ''}!`,
          ['View all promotions', 'Find salons'],
          promotions.slice(0, 5),
          'promotions'
        );
      } else {
        addBotMessage(
          "I couldn't find any active promotions right now. Check back later for new deals!",
          ['Find salons', 'View services', 'Browse products']
        );
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      addBotMessage(
        "I had trouble fetching promotions. Please try again.",
        ['Find salons', 'View services']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleProductsQuery = async (text: string) => {
    try {
      setIsTyping(true);
      
      // Extract search terms
      const searchMatch = text.match(/(?:find|search|show|get|want|looking for|need|buy|shop)\s+(?:me\s+)?(?:a\s+)?(.+)/i);
      const searchTerm = searchMatch ? searchMatch[1].trim() : '';
      
      const filters: any = {};
      if (searchTerm && !/products?|item|items/i.test(searchTerm)) {
        filters.search = searchTerm;
      }
      if (/in.?stock|available/i.test(text)) {
        filters.inStock = 'true';
      }
      
      const products = await getProducts(filters);
      if (products && products.length > 0) {
        addBotMessage(
          `🛍️ Found ${products.length} product${products.length > 1 ? 's' : ''}!`,
          ['View all products', 'Browse categories'],
          products.slice(0, 5),
          'products'
        );
      } else {
        addBotMessage(
          "I couldn't find products matching your search. Try a different search term.",
          ['View all products', 'Browse categories', 'Find salons']
        );
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      addBotMessage(
        "I had trouble fetching products. Please try again.",
        ['View all products', 'Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleTrendsQuery = async (text: string) => {
    try {
      setIsTyping(true);
      
      // Extract category if mentioned
      let category: string | undefined;
      if (/hair/i.test(text)) category = 'HAIR';
      else if (/nail/i.test(text)) category = 'NAILS';
      else if (/makeup|make.up/i.test(text)) category = 'MAKEUP';
      else if (/spa|facial/i.test(text)) category = 'SPA';
      
      const trends = await getTrends(category);
      if (trends && trends.length > 0) {
        addBotMessage(
          `✨ Found ${trends.length} trend${trends.length > 1 ? 's' : ''}!`,
          ['View all trends', 'Show hair trends', 'Show nail trends'],
          trends.slice(0, 5),
          'trends'
        );
      } else {
        addBotMessage(
          "I couldn't find trends right now. Check back later for new trends!",
          ['View all trends', 'Find salons', 'View services']
        );
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      addBotMessage(
        "I had trouble fetching trends. Please try again.",
        ['View all trends', 'Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleGalleryQuery = async (text: string) => {
    try {
      setIsTyping(true);
      
      // Try to extract salon name or ID from text
      const salonMatch = text.match(/(?:salon|from)\s+([^,]+)|([A-Za-z\s]+)\s+(?:salon|gallery)/i);
      // For now, just show a message - in a real implementation, you'd search for the salon first
      addBotMessage(
        "To view a salon's gallery, please specify which salon you'd like to see. For example: 'Show me gallery from [salon name]' or first search for a salon and then click to view its gallery.",
        ['Find salons', 'Browse featured salons']
      );
    } catch (error) {
      console.error('Error handling gallery query:', error);
      addBotMessage(
        "I had trouble with that request. Please try searching for a salon first.",
        ['Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleReviewsQuery = async (text: string) => {
    try {
      setIsTyping(true);
      
      // Try to extract salon name from text
      addBotMessage(
        "To view reviews, please specify which salon you'd like to see reviews for. For example: 'Show me reviews for [salon name]' or search for a salon and click to view its reviews.",
        ['Find salons', 'Browse featured salons']
      );
    } catch (error) {
      console.error('Error handling reviews query:', error);
      addBotMessage(
        "I had trouble with that request. Please try searching for a salon first.",
        ['Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSalonProfileQuery = async (text: string) => {
    try {
      setIsTyping(true);
      
      // Try featured salons if no specific salon mentioned
      if (/featured|popular|best|top/i.test(text)) {
        const featured = await getFeaturedSalons();
        if (featured && featured.length > 0) {
          const salonMessage: Message = {
            id: `salons-${Date.now()}`,
            type: 'salons',
            content: `⭐ Found ${featured.length} featured salon${featured.length > 1 ? 's' : ''}! Click any salon to view full profile, services, prices, and gallery.`,
            data: featured.slice(0, 3),
            quickActions: ['View all salons', 'Browse services']
          };
          setMessages(prev => [...prev, salonMessage]);
        }
      } else {
        // Try to search for salons
        const found = await handleSalonSearch(text);
        if (!found) {
          addBotMessage(
            "I couldn't find a specific salon matching that. Try searching for a salon name or location, or browse featured salons.",
            ['Find salons near me', 'Browse featured salons', 'Search by service']
          );
        }
      }
    } catch (error) {
      console.error('Error handling salon profile query:', error);
      addBotMessage(
        "I had trouble with that request. Please try searching for a salon.",
        ['Find salons']
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'View all results' || action === 'Browse all salons' || action === 'View all salons') {
      router.push('/salons');
      setIsOpen(false);
      return;
    }
    
    if (action === 'View all services') {
      router.push('/services');
      setIsOpen(false);
      return;
    }
    
    if (action === 'View all promotions') {
      router.push('/promotions');
      setIsOpen(false);
      return;
    }
    
    if (action === 'View all products' || action === 'Browse all products') {
      router.push('/products');
      setIsOpen(false);
      return;
    }
    
    if (action === 'View all trends' || action === 'Show all trends') {
      router.push('/trends');
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

    // Handle action queries
    if (action.includes('Show') || action.includes('View') || action.includes('Find') || action.includes('Search')) {
      handleSendMessage(action);
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
                ) : message.type === 'services' ? (
                  // Services display
                  <div className={`${styles.message} ${styles.bot}`}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.data && message.data.length > 0 && (
                      <div className={styles.salonResults}>
                        {message.data.map((service: any) => (
                          <div
                            key={service.id}
                            className={styles.salonCard}
                            onClick={() => service.salonId && handleSalonClick(service.salonId)}
                            style={{ cursor: service.salonId ? 'pointer' : 'default' }}
                          >
                            <div className={styles.salonCardHeader}>
                              <h4 className={styles.salonCardName}>{service.name}</h4>
                              {service.price && (
                                <div className={styles.salonCardRating}>
                                  <FaDollarSign /> R{service.price}
                                </div>
                              )}
                            </div>
                            {service.description && (
                              <div className={styles.salonCardLocation} style={{ marginTop: '4px' }}>
                                {service.description.substring(0, 100)}{service.description.length > 100 ? '...' : ''}
                              </div>
                            )}
                            {service.category && (
                              <div className={styles.salonCardServices}>
                                {service.category} • {service.duration || 'Duration varies'}
                              </div>
                            )}
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
                ) : message.type === 'promotions' ? (
                  // Promotions display
                  <div className={`${styles.message} ${styles.bot}`}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.data && message.data.length > 0 && (
                      <div className={styles.salonResults}>
                        {message.data.map((promo: any) => (
                          <div
                            key={promo.id}
                            className={styles.salonCard}
                            onClick={() => promo.service?.salonId && handleSalonClick(promo.service.salonId)}
                            style={{ cursor: promo.service?.salonId ? 'pointer' : 'default' }}
                          >
                            <div className={styles.salonCardHeader}>
                              <h4 className={styles.salonCardName}>
                                {promo.service?.name || promo.product?.name || 'Special Offer'}
                              </h4>
                              <div className={styles.salonCardRating} style={{ color: '#e74c3c' }}>
                                {promo.discountPercentage}% OFF
                              </div>
                            </div>
                            {promo.description && (
                              <div className={styles.salonCardLocation} style={{ marginTop: '4px' }}>
                                {promo.description}
                              </div>
                            )}
                            <div className={styles.salonCardServices}>
                              <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                R{promo.originalPrice}
                              </span>
                              {' → '}
                              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                R{promo.promotionalPrice}
                              </span>
                            </div>
                            {promo.service?.salon && (
                              <div className={styles.salonCardLocation} style={{ marginTop: '4px', fontSize: '12px' }}>
                                <FaMapMarkerAlt /> {promo.service.salon.name}
                              </div>
                            )}
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
                ) : message.type === 'products' ? (
                  // Products display
                  <div className={`${styles.message} ${styles.bot}`}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.data && message.data.length > 0 && (
                      <div className={styles.salonResults}>
                        {message.data.map((product: any) => (
                          <div
                            key={product.id}
                            className={styles.salonCard}
                            onClick={() => router.push(`/products`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={styles.salonCardHeader}>
                              <h4 className={styles.salonCardName}>{product.name}</h4>
                              <div className={styles.salonCardRating}>
                                <FaDollarSign /> R{product.salePrice || product.price}
                              </div>
                            </div>
                            {product.description && (
                              <div className={styles.salonCardLocation} style={{ marginTop: '4px' }}>
                                {product.description.substring(0, 100)}{product.description.length > 100 ? '...' : ''}
                              </div>
                            )}
                            <div className={styles.salonCardServices}>
                              {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                              {product.isOnSale && product.salePrice && (
                                <span style={{ color: '#e74c3c', marginLeft: '8px' }}>
                                  SALE: R{product.price} → R{product.salePrice}
                                </span>
                              )}
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
                ) : message.type === 'trends' ? (
                  // Trends display
                  <div className={`${styles.message} ${styles.bot}`}>
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.data && message.data.length > 0 && (
                      <div className={styles.salonResults}>
                        {message.data.map((trend: any) => (
                          <div
                            key={trend.id}
                            className={styles.salonCard}
                            onClick={() => router.push(`/trends`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={styles.salonCardHeader}>
                              <h4 className={styles.salonCardName}>{trend.title}</h4>
                              {trend.category && (
                                <div className={styles.salonCardRating}>
                                  {trend.category}
                                </div>
                              )}
                            </div>
                            {trend.description && (
                              <div className={styles.salonCardLocation} style={{ marginTop: '4px' }}>
                                {trend.description.substring(0, 100)}{trend.description.length > 100 ? '...' : ''}
                              </div>
                            )}
                            <div className={styles.salonCardServices}>
                              {trend.likeCount || 0} likes • {trend.viewCount || 0} views
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
              placeholder="Ask about salons, services, promotions, products, trends, or booking..."
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
                  'Show promotions',
                  'View services',
                  'Browse products'
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
