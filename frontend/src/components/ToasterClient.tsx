"use client";

import { ToastContainer } from 'react-toastify';
import ToastCloseButton from '@/components/ToastCloseButton';
import { useAuth } from '@/hooks/useAuth';

export default function ToasterClient() {
  const { user } = useAuth();
  
  // Force re-mount when user changes to prevent DOM cleanup issues
  // This fixes the "removeChild" error in development mode
  const containerKey = user?.id || 'anonymous';
  
  return (
    <ToastContainer
      key={containerKey}
      position="bottom-right"
      theme="light"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      draggable={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      closeButton={(props) => <ToastCloseButton {...props} />}
      limit={3}
    />
  );
}
