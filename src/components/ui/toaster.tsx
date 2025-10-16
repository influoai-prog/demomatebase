'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(15,23,42,0.8)',
          color: 'white',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(16px)'
        }
      }}
    />
  );
}
