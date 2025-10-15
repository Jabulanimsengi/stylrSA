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
import MobileBottomNav from '@/components/MobileBottomNav';
import ClientChatWidget from '@/components/ClientChatWidget';
import AuthSessionProvider from '@/components/AuthSessionProvider';
import CookieBanner from '@/components/CookieBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Analytics from '@/components/Analytics';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#8B4513',
};

export const metadata: Metadata = {
  title: 'Stylr SA - Find and Book Salon Appointments Online',
  description: 'Your one-stop platform for discovering, booking, and managing salon services. Find the best salons and stylists near you.',
  keywords: 'salon, booking, appointment, beauty, haircut, nails, stylist, hairdresser',
  authors: [{ name: 'Stylr SA Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stylr SA',
  },
  openGraph: {
    title: 'Stylr SA - Find and Book Salon Appointments Online',
    description: 'Your one-stop platform for discovering, booking, and managing salon services.',
    url: 'https://thesalonhub.com', // Replace with your actual domain
    siteName: 'Stylr SA',
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
    title: 'Stylr SA - Find and Book Salon Appointments Online',
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
        <ErrorBoundary>
          <AuthSessionProvider>
            <ThemeProvider>
              <AuthProvider> {/* Wrap with AuthProvider */}
                <SocketProvider>
                  <AuthModalProvider>
                    <div className="app-shell">
                      <Navbar />
                      <div className="app-content">
                        <main className="main-content">{children}</main>
                        <Footer />
                      </div>
                      <MobileBottomNav />
                    </div>
                    <ClientChatWidget />
                    <ToastContainer position="bottom-right" theme="colored" />
                    <CookieBanner />
                    <Suspense fallback={null}>
                      <Analytics />
                    </Suspense>
                    <PWAInstallPrompt />
                  </AuthModalProvider>
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}