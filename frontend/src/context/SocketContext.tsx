// frontend/src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { authStatus, user } = useAuth();

  const userId = user?.id;

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) {
      setSocket((current) => {
        if (current) {
          current.disconnect();
        }
        return null;
      });
      return;
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined; // same-origin if undefined
    const nextSocket = io(WS_URL, {
      withCredentials: true,
      query: { userId },
    });

    nextSocket.on('connect', () => {
      console.log('Socket connected:', nextSocket.id);
      nextSocket.emit('register', userId);
    });

    nextSocket.on('newBooking', (data) => {
      toast.info(`New Booking Request: ${data.service.title} from ${data.client.firstName}`);
    });

    nextSocket.on('bookingUpdate', (data) => {
      toast.success(`Your booking has been ${data.status.toLowerCase()}!`);
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
    };
  }, [authStatus, userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};