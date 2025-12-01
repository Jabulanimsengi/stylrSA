// frontend/src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    // Always connect (even when not authenticated) to receive public broadcasts
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined; // same-origin if undefined
    
    // Pass userId in query params if authenticated for immediate socket authentication
    const socketOptions: any = { 
      withCredentials: true,
      query: {},
      // Reconnection settings for better resilience
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    };
    
    if (authStatus === 'authenticated' && userId) {
      socketOptions.query.userId = userId;
    }
    
    const nextSocket = io(WS_URL, socketOptions);

    nextSocket.on('connect', () => {
      console.log('Socket connected:', nextSocket.id);
      reconnectAttempts.current = 0; // Reset on successful connection
      setStatus({ isConnected: true, isRegistered: Boolean(userId) });
      if (userId) nextSocket.emit('register', userId);
    });

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setStatus({ isConnected: false, isRegistered: false });
      // Don't crash - socket.io will auto-reconnect
    };

    const handleConnectError = (error: Error) => {
      console.warn('Socket connection error:', error.message);
      reconnectAttempts.current++;
      setStatus({ isConnected: false, isRegistered: false });
      // Silently handle - socket.io will retry automatically
    };

    const handleReconnectAttempt = (attempt: number) => {
      console.log(`Socket reconnection attempt ${attempt}/${maxReconnectAttempts}`);
    };

    const handleReconnectFailed = () => {
      console.warn('Socket reconnection failed after max attempts');
      // Don't crash the app - just stay disconnected
    };

    nextSocket.on('disconnect', handleDisconnect);
    nextSocket.on('connect_error', handleConnectError);
    nextSocket.io.on('reconnect_attempt', handleReconnectAttempt);
    nextSocket.io.on('reconnect_failed', handleReconnectFailed);

    nextSocket.on('newBooking', (data) => {
      try {
        toast.info(`New Booking Request: ${data?.service?.title || 'Service'} from ${data?.client?.firstName || 'Client'}`);
      } catch (e) {
        console.warn('Error handling newBooking event:', e);
      }
    });

    nextSocket.on('bookingUpdate', (data) => {
      try {
        toast.success(`Your booking has been ${data?.status?.toLowerCase() || 'updated'}!`);
      } catch (e) {
        console.warn('Error handling bookingUpdate event:', e);
      }
    });

    // Handle generic errors to prevent crashes
    nextSocket.on('error', (error) => {
      console.warn('Socket error:', error);
    });

    setSocket(nextSocket);

    return () => {
      setStatus({ isConnected: false, isRegistered: false });
      nextSocket.off('disconnect', handleDisconnect);
      nextSocket.off('connect_error', handleConnectError);
      nextSocket.io.off('reconnect_attempt', handleReconnectAttempt);
      nextSocket.io.off('reconnect_failed', handleReconnectFailed);
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