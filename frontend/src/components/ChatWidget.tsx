"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext";
import { ChatMessage, Conversation, User } from "@/types";
import { FaMinus, FaTimes, FaCheck, FaCheckDouble } from "react-icons/fa";
import { toast } from "react-toastify";
import { showError } from "@/lib/errors";

type MessageView = ChatMessage & { tempId?: string; pending?: boolean };

declare global {
  interface Window {
    openChatWidget?: (recipientId: string, recipientName?: string) => void;
  }
}

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
  const endRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior });
  };

  const openChat = async (recipientId: string, recipientName?: string) => {
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

      const msgsRes = await fetch(`/api/chat/conversations/${convo.id}`, { credentials: "include" });
      const msgs = (await msgsRes.json()) as ChatMessage[];
      setMessages(msgs.map((m) => ({ ...m, pending: false })));
      setTimeout(() => scrollToBottom("auto"), 50);
    } catch (e: any) {
      showError(e, "Could not start chat");
    }
  };

  // expose global opener
  useEffect(() => {
    window.openChatWidget = openChat;
    return () => {
      window.openChatWidget = undefined;
    };
  }, [authStatus, userId]);

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
  }, [socket, conversation?.id]);

  const otherParticipant: User | null = useMemo(() => {
    if (!user || !conversation) return null;
    return conversation.user1?.id === user.id ? conversation.user2 : conversation.user1;
  }, [conversation, user]);

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

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : recipient?.name || "Chat"}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => setIsMinimized((m) => !m)} aria-label="Minimize chat">
            <FaMinus />
          </button>
          <button className={styles.iconBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
            <FaTimes />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className={styles.messages}>
            {messages.map((m) => {
              const mine = m.senderId === userId;
              const status = deriveStatus(m, userId);
              return (
                <div key={m.id} className={`${styles.bubble} ${mine ? styles.sent : styles.received}`}>
                  <div>{m.content}</div>
                  {mine && (
                    <div className={styles.status}>
                      {status === "sending" && <span className={styles.statusText}>Sending…</span>}
                      {status === "sent" && (
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
