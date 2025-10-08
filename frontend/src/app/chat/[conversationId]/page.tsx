'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { ChatMessage, Conversation } from '@/types';
import styles from './ChatPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchChatData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [convoRes, messagesRes] = await Promise.all([
        fetch(`/api/chat/conversations/details/${params.conversationId}`, { credentials: 'include' }),
        fetch(`/api/chat/conversations/${params.conversationId}`, { credentials: 'include' }),
      ]);

      if (convoRes.ok && messagesRes.ok) {
        setConversation(await convoRes.json());
        setMessages(await messagesRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.conversationId, router]);

  useEffect(() => {
    if (params.conversationId) {
      fetchChatData();
    }
  }, [params.conversationId, fetchChatData]);
  
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50); 
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: ChatMessage) => {
        if (message.conversationId === params.conversationId) {
          setMessages(prev => [...prev, message]);
        }
      };
      socket.on('newMessage', handleNewMessage);
      return () => { socket.off('newMessage', handleNewMessage); };
    }
  }, [socket, params.conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !socket || !userId) return;
    
    const recipient = conversation?.user1.id === userId ? conversation?.user2 : conversation?.user1;
    if (!recipient) return;

    socket.emit('sendMessage', {
      recipientId: recipient.id,
      body: newMessage,
    });
    
    const tempMessage: any = {
      id: Date.now().toString(),
      content: newMessage,
      createdAt: new Date().toISOString(),
      senderId: userId,
      conversationId: params.conversationId,
      delivered: false // Temp status
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  };
  
  const otherParticipant = conversation?.user1.id === userId ? conversation?.user2 : conversation?.user1;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <button onClick={() => router.push('/chat')} className={styles.desktopHidden}>
          <FaArrowLeft />
        </button>
        <span>
          {otherParticipant ? `Chat with ${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Chat'}
        </span>
      </div>
      <div className={styles.messageStream}>
        {messages.map((msg: any) => (
          <div key={msg.id} className={`${styles.messageBubble} ${msg.senderId === userId ? styles.sent : styles.received}`}>
            {msg.content}
            {msg.senderId === userId && (
              <span className={styles.tick}>{msg.delivered ? '✔✔' : '✔'}</span>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input 
          type="text" 
          className={styles.textInput}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
    </div>
  );
}