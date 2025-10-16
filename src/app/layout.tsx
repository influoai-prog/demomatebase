import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mate Shop',
  description: 'Mate Shop showcases Base-powered gifting experiences with automated spend permissions.',
  metadataBase: new URL('https://mate-shop.local'),
  icons: [{ url: '/favicon.ico' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen">
            <Suspense fallback={<div className="h-20" aria-hidden="true" />}>
              <Navbar />
            </Suspense>
            <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
