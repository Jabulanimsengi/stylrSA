"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "./useAuth";
import { useAuthModal } from "@/context/AuthModalContext";
import { apiJson } from "@/lib/api";
import { toFriendlyMessage } from "@/lib/errors";

interface StartConversationOptions {
  recipientName?: string;
  onCompleted?: () => void;
}

export function useStartConversation() {
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const [isStarting, setIsStarting] = useState(false);

  const startConversation = useCallback(
    async (recipientId: string, options: StartConversationOptions = {}) => {
      if (!recipientId) {
        toast.error("Unable to start a chat: missing recipient.");
        return;
      }

      if (authStatus !== "authenticated") {
        openModal("login");
        toast.info("Please log in to start a conversation.");
        return;
      }

      if (user?.id === recipientId) {
        toast.error("You cannot message yourself.");
        return;
      }

      try {
        setIsStarting(true);
        const conversation = await apiJson<{ id: string }>("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipientId }),
        });

        options.onCompleted?.();
        let handled = false;
        if (typeof window !== "undefined") {
          if (typeof window.showChatWidget === "function") {
            window.showChatWidget(conversation.id);
            handled = true;
          } else if (typeof window.openChatWidget === "function") {
            window.openChatWidget(recipientId, options.recipientName);
            handled = true;
          }
        }

        if (!handled) {
          router.push(`/chat/${conversation.id}`);
        }
      } catch (error) {
        toast.error(toFriendlyMessage(error, "Unable to open chat."));
      } finally {
        setIsStarting(false);
      }
    },
    [authStatus, openModal, router, user?.id],
  );

  return { startConversation, isStarting };
}
