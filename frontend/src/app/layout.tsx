// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css'; // Add toastify CSS
import { ToastContainer } from 'react-toastify'; // Import toast container
import { SocketProvider } from '@/context/SocketContext'; // Import our provider
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { /* ... */ };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider> {/* Wrap everything */}
          <Navbar />
          <main>{children}</main>
          <ToastContainer position="bottom-right" theme="colored" /> {/* Add container */}
        </SocketProvider>
      </body>
    </html>
  );
}