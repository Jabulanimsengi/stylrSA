'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Conversation } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './ChatLayout.module.css';
import { useSocket } from '@/context/SocketContext';
import Spinner from '@/components/Spinner';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authStatus, userId } = useAuth(); // Use the new authStatus from the upgraded hook
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();

  // Check if a specific conversation URL is active (e.g., /chat/some-id)
  const isConversationActive = pathname.split('/').length > 2;

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // This check is a safeguard, but the useEffect below is the primary guard
      return;
    }
    const res = await fetch('http://localhost:3000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setConversations(await res.json());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // This effect now correctly handles the auth lifecycle
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      fetchConversations();
    }
  }, [authStatus, router, fetchConversations]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = () => {
        // Refetch conversations to get the latest message and order
        fetchConversations();
      };
      socket.on('newMessage', handleNewMessage);
      return () => { socket.off('newMessage', handleNewMessage); };
    }
  }, [socket, fetchConversations]);

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find(p => p.id !== userId);
  };

  // Show a spinner while the initial auth check is happening
  if (authStatus === 'loading') {
    return <Spinner />;
  }

  return (
    <div className={styles.chatContainer}>
      <aside className={`${styles.sidebar} ${isConversationActive ? styles.mobileHidden : ''}`}>
        <div className={styles.sidebarHeader}>Conversations</div>
        {isLoading ? <Spinner /> : (
          <div className={styles.conversationList}>
            {conversations.map(convo => {
              const otherParticipant = getOtherParticipant(convo);
              if (!otherParticipant) return null;
              return (
                <Link href={`/chat/${convo.id}`} key={convo.id}
                  className={`${styles.conversationLink} ${pathname === `/chat/${convo.id}` ? styles.activeConversation : ''}`}
                >
                  <p className={styles.participantName}>
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </p>
                  <p className={styles.lastMessage}>
                    {convo.messages[0]?.body || '...'}
                  </p>
                </Link>
              )
            })}
            {conversations.length === 0 && <p style={{textAlign: 'center', padding: '1rem', color: '#718096'}}>No conversations yet.</p>}
          </div>
        )}
      </aside>
      
      <main className={`${styles.mainContent} ${!isConversationActive ? styles.mobileHidden : ''}`}>
        {children}
      </main>
    </div>
  );
}