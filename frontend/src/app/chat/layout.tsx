'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Conversation } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './ChatLayout.module.css';
import { useSocket } from '@/context/SocketContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authStatus, user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();

  const isConversationActive = pathname.split('/').length > 2;

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/chat/conversations', {
      credentials: 'include',
    });
    if (res.ok) {
      setConversations(await res.json());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/');
    }
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      fetchConversations();
    }
  }, [authStatus, router, fetchConversations]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const refresh = () => fetchConversations();

    socket.on('message:new', refresh);
    socket.on('message:sent', refresh);

    return () => {
      socket.off('message:new', refresh);
      socket.off('message:sent', refresh);
    };
  }, [socket, fetchConversations]);

  const getOtherParticipant = (convo: Conversation) => {
    if (convo.participants && convo.participants.length) {
      return convo.participants.find((p) => p.id !== userId);
    }
    if (convo.user1 && convo.user1.id !== userId) {
      return convo.user1;
    }
    if (convo.user2 && convo.user2.id !== userId) {
      return convo.user2;
    }
    return undefined;
  };

  if (authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.chatContainer}>
      <aside className={`${styles.sidebar} ${isConversationActive ? styles.mobileHidden : ''}`}>
        <div className={styles.sidebarHeader}>
          <span>Conversations</span>
          <ThemeToggle />
        </div>
        {isLoading ? (
          <div className={styles.conversationList}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`${styles.conversationLink} skeleton`} style={{ height: '4.25rem', borderRadius: '1rem' }} />
            ))}
          </div>
        ) : (
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
                    {convo.messages && convo.messages[0]?.content
                      ? convo.messages[0].content
                      : convo.lastMessage?.content
                        ? convo.lastMessage.content
                        : 'No messages yet'}
                  </p>
                </Link>
              )
            })}
            {conversations.length === 0 && (
              <p className={styles.emptyState}>Start a conversation by booking a service or replying to a client.</p>
            )}
          </div>
        )}
      </aside>
      
      <main className={`${styles.mainContent} ${!isConversationActive ? styles.mobileHidden : ''}`}>
        {children}
      </main>
    </div>
  );
}