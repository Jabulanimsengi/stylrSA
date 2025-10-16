// frontend/src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

const SocketContext = createContext<Socket | null>(null);
const SocketStatusContext = createContext({ isConnected: false, isRegistered: false });

export const useSocket = () => {
  return useContext(SocketContext);
};

export const useSocketStatus = () => {
  return useContext(SocketStatusContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState({ isConnected: false, isRegistered: false });
  const { authStatus, user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    // Always connect (even when not authenticated) to receive public broadcasts
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined; // same-origin if undefined
    
    // Pass userId in query params if authenticated for immediate socket authentication
    const socketOptions: any = { 
      withCredentials: true,
      query: {}
    };
    
    if (authStatus === 'authenticated' && userId) {
      socketOptions.query.userId = userId;
    }
    
    const nextSocket = io(WS_URL, socketOptions);

    nextSocket.on('connect', () => {
      console.log('Socket connected:', nextSocket.id);
      setStatus({ isConnected: true, isRegistered: Boolean(userId) });
      if (userId) nextSocket.emit('register', userId);
    });

    const handleDisconnect = () => {
      setStatus({ isConnected: false, isRegistered: false });
    };

    nextSocket.on('disconnect', handleDisconnect);
    nextSocket.on('connect_error', handleDisconnect);

    nextSocket.on('newBooking', (data) => {
      toast.info(`New Booking Request: ${data.service.title} from ${data.client.firstName}`);
    });

    nextSocket.on('bookingUpdate', (data) => {
      toast.success(`Your booking has been ${data.status.toLowerCase()}!`);
    });

    setSocket(nextSocket);

    return () => {
      setStatus({ isConnected: false, isRegistered: false });
      nextSocket.off('disconnect', handleDisconnect);
      nextSocket.off('connect_error', handleDisconnect);
      nextSocket.disconnect();
    };
    // Reconnect when auth status or userId changes to pass updated credentials
  }, [authStatus, userId]);



  return (
    <SocketContext.Provider value={socket}>
      <SocketStatusContext.Provider value={status}>
        {children}
      </SocketStatusContext.Provider>
    </SocketContext.Provider>
  );
};