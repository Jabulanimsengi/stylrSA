// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { SocketProvider } from '@/context/SocketContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { AuthProvider } from '@/context/AuthContext'; // Import the new provider
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileNavIcons from '@/components/MobileNavIcons';
import ClientChatWidget from '@/components/ClientChatWidget';
import AuthSessionProvider from '@/components/AuthSessionProvider';
import CookieBanner from '@/components/CookieBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Analytics from '@/components/Analytics';
import ToasterClient from '@/components/ToasterClient';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ZoomHandler from '@/components/ZoomHandler';
import AuthModalHandler from '@/components/AuthModalHandler';
import { Suspense } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SkipToContent from '@/components/SkipToContent/SkipToContent';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B4513',
};

export const metadata: Metadata = {
  title: 'Stylr SA - Find and Book Salon Appointments Online',
  description: 'Find and book beauty services across South Africa. Discover expert braiders, nail technicians, makeup artists, massage therapists, hair stylists, and more. Top-rated salons, spas, and beauty professionals in one platform.',
  keywords: 'salon booking, beauty services, hair salon, braiding salon, nail salon, makeup artist, massage therapist, spa, barber, mens grooming, bridal services, South Africa, Johannesburg, Cape Town, Durban',
  authors: [{ name: 'Stylr SA Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo-transparent.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/logo-transparent.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'MdWcHRFxz3-UMrPPAxgFGXfqCoTTAzPRZ7a9igeRHRk',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stylr SA',
  },
  openGraph: {
    title: 'Stylr SA - Find and Book Salon Appointments Online',
    description: 'Find and book beauty services across South Africa. Discover expert braiders, nail technicians, makeup artists, massage therapists, hair stylists, and more.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app',
    siteName: 'Stylr SA',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/logo-transparent.png`,
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA - Find and Book Salon Appointments Online',
    description: 'Find and book beauty services across South Africa. Discover expert braiders, nail technicians, makeup artists, and more.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/logo-transparent.png`],
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
        <SkipToContent />
        <ErrorBoundary>
          <AuthSessionProvider>
            <ThemeProvider>
              <AuthProvider> {/* Wrap with AuthProvider */}
                <SocketProvider>
                  <AuthModalProvider>
                    <Suspense fallback={null}>
                      <AuthModalHandler />
                    </Suspense>
                    <div className="app-shell">
                      <Navbar />
                      <MobileNavIcons />
                      <div className="app-content">
                        <main className="main-content" id="main-content">{children}</main>
                        <Footer />
                      </div>
                      <MobileBottomNav />
                    </div>
                    <ClientChatWidget />
                    <ToasterClient />
                    <CookieBanner />
                    <ZoomHandler />
                    <Suspense fallback={null}>
                      <Analytics />
                    </Suspense>
                    <VercelAnalytics />
                    <SpeedInsights />
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