'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Menu, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-store';
import { cn } from '@/lib/utils';
import { ConnectWalletButton } from '../wallet/connect-wallet-button';

const categories = [
  { label: 'Clothing', value: 'clothing' },
  { label: 'Food', value: 'food' },
  { label: 'Gifts', value: 'gifts' },
  { label: 'Erotic', value: 'erotic', gated: true }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lines = useCart((state) => state.lines);
  const [search, setSearch] = useState(searchParams?.get('q') ?? '');

  const itemCount = useMemo(
    () => lines.reduce((acc, line) => acc + line.quantity, 0),
    [lines],
  );

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
        <div className="flex items-center gap-6">
          <Link href="/" className="glass-button text-sm font-semibold uppercase tracking-[0.4em]">
            Glass Gift Shop
          </Link>
          <nav className="hidden items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/60 md:flex">
            {categories.map((category) => {
              const href = category.gated ? '/legal/erotic-gate' : `/shop?category=${category.value}`;
              const active =
                pathname?.startsWith('/shop') && searchParams?.getAll('category').includes(category.value);
              return (
                <Link
                  key={category.value}
                  href={href}
                  className={cn('rounded-full px-4 py-2 transition hover:text-white', active && 'bg-white/10 text-white')}
                >
                  {category.label}
                </Link>
              );
            })}
          </nav>
        </div>
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
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-900">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent>
              <div className="mt-12 flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Input placeholder="Search gifts" value={search} onChange={(event) => setSearch(event.target.value)} />
                  <Button type="submit" className="rounded-full">
                    Search
                  </Button>
                </form>
                <div className="flex flex-col gap-2 text-sm uppercase tracking-[0.3em] text-white/60">
                  {categories.map((category) => {
                    const href = category.gated ? '/legal/erotic-gate' : `/shop?category=${category.value}`;
                    return (
                      <Link key={category.value} href={href} className="rounded-full px-3 py-2 hover:bg-white/10 hover:text-white">
                        {category.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
