'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { apiJson } from '@/lib/api';
import { Conversation } from '@/types';

export default function ConversationRedirectPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { user, authStatus } = useAuth();

  useEffect(() => {
    if (!params?.conversationId) {
      router.replace('/chat');
      return;
    }

    if (authStatus === 'unauthenticated') {
      toast.info('Please log in to view your messages.');
      router.replace('/');
      return;
    }

    if (authStatus !== 'authenticated') {
      return;
    }

    const openConversation = async () => {
      try {
        const conversation = await apiJson<Conversation>(
          `/api/chat/conversations/details/${params.conversationId}`,
          { credentials: 'include' },
        );

        const other = conversation.user1Id === user?.id ? conversation.user2 : conversation.user1;
        const recipientId = other?.id;
        const displayName = `${other?.firstName ?? ''} ${other?.lastName ?? ''}`.trim() || other?.email;

        if (recipientId) {
          window.showChatWidget?.();
          if (typeof window.openChatWidget === 'function') {
            window.openChatWidget(recipientId, displayName);
          }
        }
      } catch {
        toast.error('Unable to open conversation.');
      } finally {
        router.replace('/chat');
      }
    };

    void openConversation();
  }, [authStatus, params?.conversationId, router, user?.id]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <LoadingSpinner />
      <p className="text-sm text-[color:var(--color-text-muted)]">Opening your conversation…</p>
    </div>
  );
}