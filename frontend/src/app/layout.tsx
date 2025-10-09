// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from '@/context/SocketContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext'; // Import the new provider
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Salon Hub - Find and Book Salon Appointments Online',
  description: 'Your one-stop platform for discovering, booking, and managing salon services. Find the best salons and stylists near you.',
  keywords: 'salon, booking, appointment, beauty, haircut, nails, stylist, hairdresser',
  authors: [{ name: 'The Salon Hub Team' }],
  openGraph: {
    title: 'The Salon Hub - Find and Book Salon Appointments Online',
    description: 'Your one-stop platform for discovering, booking, and managing salon services.',
    url: 'https://thesalonhub.com', // Replace with your actual domain
    siteName: 'The Salon Hub',
    images: [
      {
        url: 'https://thesalonhub.com/logo-transparent.png', // Replace with a link to your logo
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Salon Hub - Find and Book Salon Appointments Online',
    description: 'Your one-stop platform for discovering, booking, and managing salon services.',
    images: ['https://thesalonhub.com/logo-transparent.png'], // Replace with a link to your logo
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <SocketProvider>
              <AuthModalProvider>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Navbar />
                  <main className="main-content" style={{ flexGrow: 1 }}>{children}</main>
                  <Footer />
                </div>
                <ChatWidget />
                <ToastContainer position="bottom-right" theme="colored" />
              </AuthModalProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}