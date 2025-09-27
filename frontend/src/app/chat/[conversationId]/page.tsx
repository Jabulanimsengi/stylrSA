'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { ChatMessage, Conversation } from '@/types';
import styles from './ChatPage.module.css';
import Spinner from '@/components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const fetchChatData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    const [convoRes, messagesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/chat/conversations/details/${params.conversationId}`, { headers }),
      fetch(`http://localhost:3000/api/chat/conversations/${params.conversationId}`, { headers }),
    ]);

    if (convoRes.ok && messagesRes.ok) {
      setConversation(await convoRes.json());
      setMessages(await messagesRes.json());
    }
    setIsLoading(false);
  }, [params.conversationId]);

  useEffect(() => {
    if (params.conversationId) {
      fetchChatData();
    }
  }, [params.conversationId, fetchChatData]);
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    
    const recipient = conversation?.participants.find(p => p.id !== userId);
    if (!recipient) return;

    socket.emit('sendMessage', {
      recipientId: recipient.id,
      body: newMessage,
    });
    
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      body: newMessage,
      createdAt: new Date().toISOString(),
      senderId: userId,
      conversationId: params.conversationId,
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  };
  
  const otherParticipant = conversation?.participants.find(p => p.id !== userId);

  if (isLoading) return <Spinner />;

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
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.messageBubble} ${msg.senderId === userId ? styles.sent : styles.received}`}>
            {msg.body}
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