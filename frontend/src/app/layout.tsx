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
import ClientAISalonFinder from '@/components/ClientAISalonFinder';
import AuthSessionProvider from '@/components/AuthSessionProvider';
import CookieBanner from '@/components/CookieBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Analytics from '@/components/Analytics';
import ToasterClient from '@/components/ToasterClient';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ZoomHandler from '@/components/ZoomHandler';
import AuthModalHandler from '@/components/AuthModalHandler';
import ClientInit from '@/components/ClientInit';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'),
  title: {
    default: 'Stylr SA - Book Hair, Nails, Makeup & Beauty Services Online',
    template: '%s | Stylr SA'
  },
  description: 'Stylr SA (stylrsa.co.za) - South Africa\'s #1 platform for booking beauty services. Find top-rated salons, braiders, nail techs, makeup artists, barbers & spas near you.',
  keywords: [
    // Brand keywords
    'Stylr SA', 'stylrsa', 'stylrsa.co.za', 'Stylr South Africa',
    // Core services
    'salon booking', 'beauty services', 'hair salon', 'braiding salon', 'nail salon', 
    'makeup artist', 'massage therapist', 'spa', 'barber', 'mens grooming', 'bridal services',
    // Locations
    'South Africa', 'Johannesburg', 'Cape Town', 'Durban', 'Pretoria',
    // Action keywords
    'book beauty services online', 'find salon near me', 'beauty appointments'
  ],
  authors: [{ name: 'Stylr SA Team', url: 'https://www.stylrsa.co.za' }],
  creator: 'Stylr SA',
  publisher: 'Stylr SA',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'MdWcHRFxz3-UMrPPAxgFGXfqCoTTAzPRZ7a9igeRHRk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Stylr SA',
  },
  openGraph: {
    title: 'Stylr SA: South Africa\'s Premier Destination for Luxury Beauty & Wellness',
    description: 'Experience excellence with South Africa\'s most trusted premium salons, luxury spas, beauty clinics, and expert wellness professionals. Book exclusive appointments with the finest service providers.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za',
    siteName: 'Stylr SA',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/logo-transparent.png`,
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA - Book Hair, Nails, Makeup & Beauty Services Online',
    description: 'Find and book beauty services across South Africa. Top-rated salons, braiders, nail techs, makeup artists, hair stylists & spas in one platform.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/logo-transparent.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientInit />
        <SkipToContent />
        <ErrorBoundary>
          <AuthSessionProvider>
            <ThemeProvider>
              <AuthProvider>
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
                    <ClientAISalonFinder />
                    <Suspense fallback={null}>
                      <ToasterClient />
                    </Suspense>
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
