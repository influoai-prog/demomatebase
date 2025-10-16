'use client';

import { useRouter } from 'next/navigation';
import { useEroticAccess } from '@/lib/age-gate';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function EroticGatePage() {
  const router = useRouter();
  const { allowed, checked, permit } = useEroticAccess();

  useEffect(() => {
    if (checked && allowed) {
      router.replace('/shop?category=Erotic');
    }
  }, [allowed, checked, router]);

  if (!checked || allowed) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="glass-card space-y-4 p-12">
        <h1 className="text-3xl font-semibold text-white">18+ confirmation</h1>
        <p className="text-sm text-white/60">
          Erotic items are curated for adults. Confirm you are 18 or older to explore this collection.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => { permit(); router.replace('/shop?category=Erotic'); }} className="rounded-full">
            I am 18 or older
          </Button>
          <Button onClick={() => router.back()} variant="outline" className="rounded-full">
            Take me back
          </Button>
        </div>
      </div>
    </div>
  );
}
