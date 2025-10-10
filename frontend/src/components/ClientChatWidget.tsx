"use client";

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false });

export default function ClientChatWidget() {
  return <ChatWidget />;
}
