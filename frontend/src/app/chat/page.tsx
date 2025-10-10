'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { Conversation } from '@/types';
import { apiJson } from '@/lib/api';

import styles from './ChatLayout.module.css';

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function ChatPage() {
  const router = useRouter();
  const socket = useSocket();
  const { authStatus, user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      return;
    }
    try {
      setIsLoading(true);
      const data = await apiJson<Conversation[]>('/api/chat/conversations', {
        credentials: 'include',
      });
      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        setConversations([]);
      }
    } catch {
      toast.error('Failed to load conversations.');
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      toast.info('Log in to view your messages.');
      router.push('/');
      return;
    }
    if (authStatus === 'authenticated') {
      loadConversations();
    }
  }, [authStatus, loadConversations, router]);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      void loadConversations();
    };

    socket.on('message:new', refresh);
    socket.on('message:sent', refresh);
    socket.on('conversation:read', refresh);

    return () => {
      socket.off('message:new', refresh);
      socket.off('message:sent', refresh);
      socket.off('conversation:read', refresh);
    };
  }, [socket, loadConversations]);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const other = conversation.user1Id === user?.id ? conversation.user2 : conversation.user1;
      const name = `${other?.firstName ?? ''} ${other?.lastName ?? ''}`.trim().toLowerCase();
      const email = other?.email?.toLowerCase() ?? '';
      return name.includes(query) || email.includes(query);
    });
  }, [conversations, searchTerm, user?.id]);

  if (isLoading || authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.chatShell}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <div>
            <h1 className={styles.sidebarTitle}>Messages</h1>
            <p className={styles.sidebarSubtitle}>All conversations sync in real time.</p>
          </div>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void loadConversations()}
            aria-label="Refresh conversations"
          >
            ↻
          </button>
        </header>

        <div className={styles.searchBox}>
          <input
            type="search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.conversationList}>
          {filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>No conversations found.</div>
          ) : (
            filteredConversations.map((conversation) => {
              const lastMessage = conversation.lastMessage;
              const other = conversation.user1Id === user?.id ? conversation.user2 : conversation.user1;
              const displayName = `${other?.firstName ?? ''} ${other?.lastName ?? ''}`.trim() || other?.email || 'Conversation';
              const snippetPrefix = lastMessage?.senderId === user?.id ? 'You: ' : '';
              const snippet = lastMessage?.content ?? 'No messages yet';
              const timestamp = formatRelativeTime(lastMessage?.createdAt ?? conversation.updatedAt);
              const unread = conversation.unreadCount ?? 0;
              const isActive = activeConversationId === conversation.id;

              return (
                <button
                  type="button"
                  key={conversation.id}
                  className={`${styles.conversationCard} ${isActive ? styles.conversationCardActive : ''}`}
                  onClick={() => {
                    const targetId = other?.id;
                    if (!targetId) {
                      toast.error('Unable to open this conversation.');
                      return;
                    }
                    setActiveConversationId(conversation.id);
                    if (typeof window !== 'undefined') {
                      window.showChatWidget?.();
                      if (typeof window.openChatWidget === 'function') {
                        window.openChatWidget(targetId, displayName);
                        return;
                      }
                    }
                    router.push(`/chat/${conversation.id}`);
                  }}
                >
                  <div className={styles.conversationHeader}>
                    <span className={styles.conversationName}>{displayName}</span>
                    <span className={styles.conversationTime}>{timestamp}</span>
                  </div>
                  <div className={styles.conversationSnippet}>
                    <span className={styles.conversationSnippetPrefix}>{snippetPrefix}</span>
                    <span className={styles.conversationSnippetBody}>{snippet}</span>
                  </div>
                  {unread > 0 && (
                    <span className={styles.unreadBadge}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className={styles.placeholderPanel}>
        <div className={styles.placeholderIllustration}>
          <div className={styles.placeholderBubble}>
            <span>💬</span>
          </div>
          <div className={styles.placeholderContent}>
            <h2>Select a conversation</h2>
            <p>Your chat history will appear here once you choose a conversation from the list.</p>
            <p className={styles.placeholderHint}>Tip: Start a chat from any product or salon page and find it here instantly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}