// frontend/src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

interface DecodedToken { sub: string; }

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.sub;

      const newSocket = io('http://localhost:3000', {
        query: { userId },
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
    }
  }, []); // This effect should ideally re-run on login/logout

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};