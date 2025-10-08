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

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user) {
      // Disconnect any existing socket on logout
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined; // same-origin if undefined
    const newSocket = io(WS_URL, {
      withCredentials: true,
      query: { userId: user.id },
    });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      // Listen for notifications
      newSocket.on('newBooking', (data) => {
        toast.info(`New Booking Request: ${data.service.title} from ${data.client.firstName}`);
      });
      
      newSocket.on('bookingUpdate', (data) => {
        toast.success(`Your booking has been ${data.status.toLowerCase()}!`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
  }, [authStatus, user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};