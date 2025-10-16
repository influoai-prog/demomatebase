import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Mate Shop',
  description: 'Mate Shop is a single-page Base-powered marketplace for twelve micro curios priced at five dollars or less.',
  metadataBase: new URL('https://mate-shop.local'),
  icons: [{ url: '/favicon.ico' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} antialiased`}>
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
