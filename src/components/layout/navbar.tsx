'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';
import { CartButton } from '@/components/cart/cart-button';

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get('q') ?? '');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (search) {
      params.set('q', search);
    } else {
      params.delete('q');
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/30 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="glass-button text-sm font-semibold uppercase tracking-[0.4em]">
          Glass Gift Shop
        </Link>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden items-center gap-2 md:flex">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search gifts"
                className="w-56 pl-12"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </form>
          <ConnectWalletButton />
          <CartButton />
          <Sheet>
            <SheetTrigger
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 md:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent>
              <div className="mt-12 flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Input
                    placeholder="Search gifts"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Button type="submit" className="rounded-full">
                    Search
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
