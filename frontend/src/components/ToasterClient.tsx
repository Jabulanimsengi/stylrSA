"use client";

import { ToastContainer } from 'react-toastify';
import ToastCloseButton from '@/components/ToastCloseButton';

export default function ToasterClient() {
  return (
    <ToastContainer
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
