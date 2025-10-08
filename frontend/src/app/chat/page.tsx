'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Conversation, User } from '@/types'; // Assuming Conversation type exists in your types
import styles from './ChatLayout.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { toast } from 'react-toastify';

// A more detailed conversation type that includes the full participant user objects
type PopulatedConversation = Omit<Conversation, 'participants'> & {
    participants: User[];
}

export default function ChatPage() {
    const { user, authStatus } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<PopulatedConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            toast.error("Please log in to view your messages.");
            router.push('/');
        }

        if (authStatus === 'authenticated') {
            const fetchConversations = async () => {
                setIsLoading(true);
                const token = localStorage.getItem('access_token');
                try {
                    const res = await fetch(`${apiUrl}/chat/conversations`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) {
                        throw new Error("Failed to load conversations");
                    }
                    const data = await res.json();
                    setConversations(data);
                } catch (error: any) {
                    toast.error(error.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchConversations();
        }
    }, [authStatus, router, apiUrl]);

    if (isLoading || authStatus === 'loading') {
        return <LoadingSpinner />;
    }

    const getOtherParticipant = (convo: PopulatedConversation) => {
        return convo.participants.find(p => p.id !== user?.id);
    };

    return (
        <div className={styles.chatContainer}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Conversations</h2>
                {conversations.length > 0 ? (
                    <ul className={styles.convoList}>
                        {conversations.map((convo) => {
                            const otherUser = getOtherParticipant(convo);
                            return (
                                <li key={convo.id} className={styles.convoItem}>
                                    <Link href={`/chat/${convo.id}`} className={styles.convoLink}>
                                        {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={styles.noConvos}>No conversations yet.</p>
                )}
            </aside>
            <main className={styles.mainContent}>
                <div className={styles.placeholder}>
                    <h2>Select a conversation</h2>
                    <p>Choose a conversation from the list on the left to start chatting.</p>
                </div>
            </main>
        </div>
    );
}