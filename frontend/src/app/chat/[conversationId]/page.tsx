'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import { ChatMessage, Conversation } from '@/types';
import styles from './ChatPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaArrowLeft, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { toast } from 'react-toastify';

type MessageView = ChatMessage & {
  tempId?: string;
  pending?: boolean;
};

const deriveStatus = (message: MessageView, currentUserId: string | undefined) => {
  if (!currentUserId || message.senderId !== currentUserId) {
    return message.readAt
      ? 'read'
      : message.deliveredAt
        ? 'delivered'
        : 'sent';
  }

  if (message.pending) {
    return 'sending';
  }

  if (message.readAt) {
    return 'read';
  }

  if (message.deliveredAt) {
    return 'delivered';
  }

  return 'sent';
};

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const socket = useSocket();
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const isMarkingReadRef = useRef(false);

  const conversationId = params.conversationId;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messageEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const fetchChatData = useCallback(async () => {
    if (!conversationId) {
      return;
    }
    setIsLoading(true);
    try {
      const [convoRes, messagesRes] = await Promise.all([
        fetch(`/api/chat/conversations/details/${conversationId}`, {
          credentials: 'include',
        }),
        fetch(`/api/chat/conversations/${conversationId}`, {
          credentials: 'include',
        }),
      ]);

      if (!convoRes.ok || !messagesRes.ok) {
        throw new Error('Failed to load chat data');
      }

      const convoData = (await convoRes.json()) as Conversation;
      const messageData = (await messagesRes.json()) as ChatMessage[];

      setConversation(convoData);
      setMessages(
        messageData.map((message) => ({
          ...message,
          pending: false,
        })),
      );
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
      toast.error('Unable to load chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const markConversationRead = useCallback(() => {
    if (!socket || !conversationId || !userId || isMarkingReadRef.current) {
      return;
    }

    const hasUnread = messages.some(
      (message) => message.senderId !== userId && !message.readAt,
    );

    if (!hasUnread) {
      return;
    }

    isMarkingReadRef.current = true;
    socket.emit('conversation:read', { conversationId });
    setTimeout(() => {
      isMarkingReadRef.current = false;
    }, 400);
  }, [socket, conversationId, userId, messages]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    if (!socket || !conversationId) {
      return;
    }
    socket.emit('conversation:join', conversationId);
    return () => {
      socket.emit('conversation:leave', conversationId);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom('auto');
      markConversationRead();
    }
  }, [isLoading, messages.length, scrollToBottom, markConversationRead]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleSent = ({ message, tempId }: { message: ChatMessage; tempId?: string }) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      setMessages((prev) => {
        const next = [...prev];
        if (tempId) {
          const index = next.findIndex((m) => m.tempId === tempId);
          if (index !== -1) {
            next[index] = { ...message, pending: false };
            return next;
          }
        }
        const exists = next.some((m) => m.id === message.id);
        if (!exists) {
          next.push({ ...message, pending: false });
        }
        return next;
      });
    };

    const handleDelivered = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? {
                ...item,
                pending: false,
                deliveredAt: message.deliveredAt,
                readAt: message.readAt,
              }
            : item,
        ),
      );
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      setMessages((prev) => {
        const exists = prev.some((existing) => existing.id === message.id);
        if (exists) {
          return prev;
        }
        return [...prev, { ...message, pending: false }];
      });
      scrollToBottom();
      if (message.senderId !== userId) {
        markConversationRead();
      }
    };

    const handleConversationRead = ({
      conversationId: updatedConversation,
      updates,
    }: {
      conversationId: string;
      updates: { id: string; readAt: string }[];
    }) => {
      if (updatedConversation !== conversationId) {
        return;
      }
      setMessages((prev) =>
        prev.map((message) => {
          const update = updates.find((item) => item.id === message.id);
          if (!update) {
            return message;
          }
          return {
            ...message,
            readAt: update.readAt,
            deliveredAt: message.deliveredAt ?? update.readAt,
          };
        }),
      );
    };

    const handleError = ({ error }: { tempId?: string; error: string }) => {
      toast.error(error ?? 'Message failed to send.');
    };

    socket.on('message:sent', handleSent);
    socket.on('message:delivered', handleDelivered);
    socket.on('message:new', handleNewMessage);
    socket.on('conversation:read', handleConversationRead);
    socket.on('message:error', handleError);

    return () => {
      socket.off('message:sent', handleSent);
      socket.off('message:delivered', handleDelivered);
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:read', handleConversationRead);
      socket.off('message:error', handleError);
    };
  }, [socket, conversationId, userId, scrollToBottom, markConversationRead]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!socket || !userId || !conversationId) {
      return;
    }

    const trimmed = newMessage.trim();
    if (!trimmed) {
      return;
    }

    const recipientId =
      conversation?.user1?.id === userId
        ? conversation?.user2?.id
        : conversation?.user1?.id;

    if (!recipientId) {
      toast.error('Unable to determine recipient.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageView = {
      id: tempId,
      tempId,
      conversationId,
      content: trimmed,
      senderId: userId,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    socket.emit('sendMessage', {
      conversationId,
      recipientId,
      body: trimmed,
      tempId,
    });
  };

  const otherParticipant = useMemo(() => {
    if (!userId || !conversation) {
      return null;
    }
    return conversation.user1.id === userId
      ? conversation.user2
      : conversation.user1;
  }, [conversation, userId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <button
          onClick={() => router.push('/chat')}
          className={styles.desktopHidden}
          aria-label="Back to conversations"
        >
          <FaArrowLeft />
        </button>
        <div className={styles.headerDetails}>
          <span className={styles.participantName}>
            {otherParticipant
              ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
              : 'Chat'}
          </span>
          <span className={styles.subTitle}>Messages are synced in real-time</span>
        </div>
      </div>
      <div className={styles.messageStream}>
        {messages.map((message) => {
          const isMine = message.senderId === userId;
          const status = deriveStatus(message, userId);
          return (
            <div
              key={message.id}
              className={`${styles.messageBubble} ${isMine ? styles.sent : styles.received}`}
            >
              <div className={styles.messageBody}>{message.content}</div>
              {isMine && (
                <div className={styles.statusRow}>
                  {status === 'sending' && <span className={styles.statusText}>Sending…</span>}
                  {status === 'sent' && (
                    <span className={styles.statusIcon} aria-label="Message sent">
                      <FaCheck />
                    </span>
                  )}
                  {status === 'delivered' && (
                    <span className={styles.statusIcon} aria-label="Message delivered">
                      <FaCheckDouble />
                    </span>
                  )}
                  {status === 'read' && (
                    <span className={`${styles.statusIcon} ${styles.statusRead}`} aria-label="Message read">
                      <FaCheckDouble />
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <form className={styles.inputArea} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.textInput}
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Type a message…"
          aria-label="Type your message"
        />
        <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}