import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Glass Gift Shop',
  description: 'Ultra-minimal glassmorphism gift shop with on-chain checkout via Base.',
  metadataBase: new URL('https://glass-gift-shop.local'),
  icons: [{ url: '/favicon.ico' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen">
            <Suspense fallback={<div className="px-6 py-4 text-sm text-white/60">Loading navigation…</div>}>
              <Navbar />
            </Suspense>
            <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
