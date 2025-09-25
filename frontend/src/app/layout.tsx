// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // <-- This line loads all your styles

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hair Salon Marketplace',
  description: 'Your one-stop platform for salon services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}