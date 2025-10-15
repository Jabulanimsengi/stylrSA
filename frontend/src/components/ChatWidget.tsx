"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import { ChatMessage, Conversation, User } from "@/types";
import { FaMinus, FaTimes, FaCheck, FaCheckDouble } from "react-icons/fa";
import { toast } from "react-toastify";
import { showError } from "@/lib/errors";
import { apiJson } from "@/lib/api";
import { sanitizeText } from "@/lib/sanitize";

type MessageView = ChatMessage & { tempId?: string; pending?: boolean };

declare global {
  interface Window {
    openChatWidget?: (recipientId: string, recipientName?: string) => void;
    showChatWidget?: (conversationId?: string) => void;
  }
}

const LAST_CONVERSATION_KEY = "chat:lastConversationId";

const deriveStatus = (message: MessageView, currentUserId?: string) => {
  if (!currentUserId || message.senderId !== currentUserId) {
    return message.readAt ? "read" : message.deliveredAt ? "delivered" : "sent";
  }
  if (message.pending) return "sending";
  if (message.readAt) return "read";
  if (message.deliveredAt) return "delivered";
  return "sent";
};

export default function ChatWidget() {
  const { user, authStatus } = useAuth();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState<{ id: string; name?: string } | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const loadedConversationRef = useRef<string | null>(null);

  const userId = user?.id;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
  }, []);

  const rememberConversation = useCallback((id: string | null) => {
    try {
      if (id) {
        localStorage.setItem(LAST_CONVERSATION_KEY, id);
      } else {
        localStorage.removeItem(LAST_CONVERSATION_KEY);
      }
    } catch {
      /* noop */
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    try {
      setIsRecentLoading(true);
      const data = await apiJson<Conversation[]>("/api/chat/conversations", {
        credentials: "include",
      });
      setRecentConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.debug("Failed to load conversations", error);
    } finally {
      setIsRecentLoading(false);
    }
  }, [authStatus]);

  const openChat = useCallback(async (recipientId: string, recipientName?: string) => {
    if (authStatus !== "authenticated") {
      toast.info("Please log in to chat.");
      return;
    }
    if (!recipientId || recipientId === userId) {
      toast.error("Invalid recipient.");
      return;
    }
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId }),
      });
      if (!res.ok) {
        let err: any = null;
        try { err = await res.json(); } catch {}
        throw err || new Error("Failed to open chat");
      }
      const convo: Conversation = await res.json();
      setConversation(convo);
      setRecipient({ id: recipientId, name: recipientName });
      setIsOpen(true);
      setIsMinimized(false);

      // Fetch messages with error handling
      try {
        const msgsRes = await fetch(`/api/chat/conversations/${convo.id}`, { credentials: "include" });
        if (!msgsRes.ok) {
          console.error("Failed to fetch messages:", msgsRes.status);
          setMessages([]);
        } else {
          const msgs = (await msgsRes.json()) as ChatMessage[];
          setMessages(Array.isArray(msgs) ? msgs.map((m) => ({ ...m, pending: false })) : []);
        }
      } catch (msgError) {
        console.error("Error fetching messages:", msgError);
        setMessages([]);
      }
      
      setTimeout(() => scrollToBottom("auto"), 50);
      refreshConversations();
      if (convo.id) {
        rememberConversation(convo.id);
      }
    } catch (error: unknown) {
      showError(error, "Could not start chat");
    }
  }, [authStatus, userId, refreshConversations, rememberConversation, scrollToBottom]);

  const openConversationById = useCallback(
    async (conversationId: string) => {
      if (authStatus !== "authenticated" || !conversationId) return;
      try {
        const convo = await apiJson<Conversation>(`/api/chat/conversations/details/${conversationId}`, {
          credentials: "include",
        });
        const msgs = await apiJson<ChatMessage[]>(`/api/chat/conversations/${conversationId}`, {
          credentials: "include",
        });
        const other = convo.user1?.id === userId ? convo.user2 : convo.user1;
        setConversation(convo);
        setRecipient(
          other
            ? {
                id: other.id,
                name: `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim() || other.email,
              }
            : null,
        );
        setMessages(Array.isArray(msgs) ? msgs.map((m) => ({ ...m, pending: false })) : []);
        setIsOpen(true);
        setIsMinimized(false);
        rememberConversation(convo.id);
        setTimeout(() => scrollToBottom("auto"), 50);
      } catch (error) {
        console.error("Failed to open conversation by id", error);
        toast.error("Could not load conversation history");
        setMessages([]);
      }
    },
    [authStatus, userId, rememberConversation, scrollToBottom],
  );

  const openExistingConversation = useCallback(
    async (convo: Conversation) => {
      if (authStatus !== "authenticated") return;
      try {
        const msgs = await apiJson<ChatMessage[]>(`/api/chat/conversations/${convo.id}`, {
          credentials: "include",
        });
        const other = convo.user1?.id === userId ? convo.user2 : convo.user1;
        setConversation(convo);
        setRecipient(other ? { id: other.id, name: `${other.firstName ?? ""} ${other.lastName ?? ""}`.trim() || other.email } : null);
        setMessages(Array.isArray(msgs) ? msgs.map((m) => ({ ...m, pending: false })) : []);
        setIsOpen(true);
        setIsMinimized(false);
        setTimeout(() => scrollToBottom("auto"), 50);
        rememberConversation(convo.id);
      } catch (error: unknown) {
        console.error("Failed to load conversation:", error);
        showError(error, "Unable to load conversation history");
        setMessages([]);
      }
    },
    [authStatus, userId, rememberConversation, scrollToBottom],
  );

  // expose global opener
  useEffect(() => {
    window.openChatWidget = openChat;
    return () => {
      window.openChatWidget = undefined;
    };
  }, [authStatus, userId, openChat]);

  useEffect(() => {
    window.showChatWidget = (conversationId?: string) => {
      if (authStatus !== "authenticated") {
        toast.info("Please log in to view your messages.");
        return;
      }

      setIsOpen(true);
      setIsMinimized(false);

      const storedId = (() => {
        if (conversationId) return conversationId;
        try {
          return localStorage.getItem(LAST_CONVERSATION_KEY) ?? undefined;
        } catch {
          return undefined;
        }
      })();

      if (storedId && storedId !== conversation?.id) {
        void openConversationById(storedId);
      } else if (storedId && storedId === conversation?.id) {
        // Same conversation - refetch messages to ensure they're up to date
        void openConversationById(storedId);
      } else if (!storedId) {
        void refreshConversations();
      }
    };
    return () => {
      window.showChatWidget = undefined;
    };
  }, [authStatus, conversation?.id, openConversationById, refreshConversations]);

  // socket room join
  useEffect(() => {
    if (!socket || !conversation?.id) return;
    socket.emit("conversation:join", conversation.id);
    return () => {
      socket.emit("conversation:leave", conversation.id);
    };
  }, [socket, conversation?.id]);

  // socket handlers
  useEffect(() => {
    if (!socket) return;

    const handleSent = ({ message, tempId }: { message: ChatMessage; tempId?: string }) => {
      setMessages((prev) => {
        const next = [...prev];
        if (tempId) {
          const idx = next.findIndex((m) => m.tempId === tempId);
          if (idx !== -1) {
            next[idx] = { ...message, pending: false };
            return next;
          }
        }
        const exists = next.some((m) => m.id === message.id);
        if (!exists) next.push({ ...message, pending: false });
        return next;
      });
      refreshConversations();
    };

    const handleDelivered = (message: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, deliveredAt: message.deliveredAt, readAt: message.readAt, pending: false } : m)),
      );
    };

    const handleNew = (message: ChatMessage) => {
      if (message.conversationId !== conversation?.id) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, { ...message, pending: false }]));
      scrollToBottom();
      refreshConversations();
    };

    const handleRead = ({ updates }: { conversationId: string; updates: { id: string; readAt: string }[] }) => {
      setMessages((prev) =>
        prev.map((m) => {
          const u = updates.find((x) => x.id === m.id);
          return u ? { ...m, readAt: u.readAt, deliveredAt: m.deliveredAt ?? u.readAt } : m;
        }),
      );
    };

    const handleError = ({ error }: { error: string }) => toast.error(error);

    socket.on("message:sent", handleSent);
    socket.on("message:delivered", handleDelivered);
    socket.on("message:new", handleNew);
    socket.on("conversation:read", handleRead);
    socket.on("message:error", handleError);

    return () => {
      socket.off("message:sent", handleSent);
      socket.off("message:delivered", handleDelivered);
      socket.off("message:new", handleNew);
      socket.off("conversation:read", handleRead);
      socket.off("message:error", handleError);
    };
  }, [socket, conversation?.id, refreshConversations, scrollToBottom]);

  const otherParticipant: User | null = useMemo(() => {
    if (!user || !conversation) return null;
    return conversation.user1?.id === user.id ? conversation.user2 : conversation.user1;
  }, [conversation, user]);

  useEffect(() => {
    if (!isOpen) return;
    refreshConversations();
  }, [isOpen, refreshConversations]);

  // Ensure messages are loaded when conversation is active
  useEffect(() => {
    if (!conversation?.id || !isOpen || isMinimized) return;
    
    // Check if we've already loaded messages for this conversation
    if (loadedConversationRef.current === conversation.id && messages.length > 0) {
      return;
    }
    
    const loadMessages = async () => {
      try {
        const msgs = await apiJson<ChatMessage[]>(`/api/chat/conversations/${conversation.id}`, {
          credentials: "include",
        });
        if (Array.isArray(msgs)) {
          setMessages(msgs.map((m) => ({ ...m, pending: false })));
          loadedConversationRef.current = conversation.id;
        }
      } catch (error) {
        console.error("Failed to refresh messages:", error);
      }
    };

    // Load messages if we have a conversation but no messages, or if it's a different conversation
    if (messages.length === 0 || loadedConversationRef.current !== conversation.id) {
      void loadMessages();
    }
  }, [conversation?.id, isOpen, isMinimized, messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !userId || !conversation?.id) return;
    const body = newMessage.trim();
    if (!body) return;
    const recipientId = otherParticipant?.id || recipient?.id;
    if (!recipientId) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic: MessageView = {
      id: tempId,
      tempId,
      conversationId: conversation.id,
      content: body,
      senderId: userId,
      deliveredAt: null,
      readAt: null,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
    scrollToBottom();
    socket.emit("sendMessage", { conversationId: conversation.id, recipientId, body, tempId });
  };

  if (!isOpen)
    return (
      <button
        className={styles.launcher}
        onClick={() => {
          if (authStatus !== "authenticated") {
            toast.info("Please log in to view your messages.");
          }
          setIsOpen(true);
          setIsMinimized(false);
        }}
      >
        Messages
      </button>
    );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {conversation
            ? otherParticipant
              ? `${otherParticipant.firstName ?? ""} ${otherParticipant.lastName ?? ""}`.trim() || "Chat"
              : recipient?.name || "Chat"
            : "Messages"}
        </div>
        <div className={styles.headerActions}>
          {conversation && (
            <button
              className={styles.iconBtn}
              onClick={() => {
                setConversation(null);
                setRecipient(null);
                setMessages([]);
                loadedConversationRef.current = null;
                rememberConversation(null);
              }}
              aria-label="Back to conversations"
            >
              ‹
            </button>
          )}
          <button className={styles.iconBtn} onClick={() => setIsMinimized((m) => !m)} aria-label="Minimize chat">
            <FaMinus />
          </button>
          <button className={styles.iconBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
            <FaTimes />
          </button>
        </div>
      </div>
      {!conversation && !isMinimized && (
        <div className={styles.conversationList}>
          {isRecentLoading ? (
            <div className={styles.listPlaceholder}>Loading conversations…</div>
          ) : recentConversations.length === 0 ? (
            <div className={styles.listPlaceholder}>No conversations yet. Start chatting with a salon owner.</div>
          ) : (
            recentConversations.map((convo) => {
              const other = convo.user1?.id === userId ? convo.user2 : convo.user1;
              const preview = convo.lastMessage?.content ? sanitizeText(convo.lastMessage.content) : "No messages yet";
              const unread = convo.unreadCount ?? 0;
              return (
                <button
                  key={convo.id}
                  className={styles.conversationItem}
                  onClick={() => openExistingConversation(convo)}
                >
                  <span className={styles.conversationName}>
                    {`${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim() || other?.email || "Conversation"}
                  </span>
                  <span className={styles.conversationPreview}>{preview}</span>
                  {unread > 0 && <span className={styles.unreadBadge}>{unread > 9 ? "9+" : unread}</span>}
                </button>
              );
            })
          )}
        </div>
      )}
      {conversation && !isMinimized && (
        <>
          <div className={styles.messages}>
            {messages.map((m) => {
              const mine = m.senderId === userId;
              const status = deriveStatus(m, userId);
              return (
                <div key={m.id} className={`${styles.bubble} ${mine ? styles.sent : styles.received}`}>
                  <div>{sanitizeText(m.content)}</div>
                  {mine && (
                    <div className={styles.status}>
                      {(status === "sent" || status === "sending") && (
                        <span className={styles.statusIcon} aria-label="Sent">
                          <FaCheck />
                        </span>
                      )}
                      {status === "delivered" && (
                        <span className={styles.statusIcon} aria-label="Delivered">
                          <FaCheckDouble />
                        </span>
                      )}
                      {status === "read" && (
                        <span className={`${styles.statusIcon} ${styles.read}`} aria-label="Read">
                          <FaCheckDouble />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form className={styles.inputRow} onSubmit={handleSend}>
            <input
              className={styles.input}
              placeholder="Type a message…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className={styles.sendBtn} type="submit" disabled={!newMessage.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
